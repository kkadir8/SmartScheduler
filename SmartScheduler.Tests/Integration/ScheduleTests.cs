using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Integration;

/// <summary>
/// TS-15 — TS-19 + TS-21/22: Schedule endpoint entegrasyon testleri.
/// GA testi uzun sürebilir; xUnit varsayılan timeout uygulamaz, gerekirse 30s yeterli.
/// </summary>
public class ScheduleTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ScheduleTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(db =>
        {
            TestDataSeeder.Seed(db);
            TestDataSeeder.AddScheduleWithEntries(db);
        });
        _client = factory.CreateClient();
    }

    private async Task SetAuthHeaderAsync()
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@smartscheduler.com", password = "Admin123!" });
        var body = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!["token"].ToString());
    }

    // ── TS-15: Program oluşturma (tüm bölümler) ──────────────────────────────
    [Fact]
    public async Task TS15_Generate_NoFilter_Returns200WithEntries()
    {
        var response = await _client.PostAsJsonAsync("/api/schedule/generate",
            new { department = (string?)null });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("fitness");
        body.Should().ContainKey("entries");
    }

    // ── TS-21: Bölüm filtreli program oluşturma (yeni özellik) ───────────────
    [Fact]
    public async Task TS21_Generate_WithDepartmentFilter_Returns200()
    {
        var response = await _client.PostAsJsonAsync("/api/schedule/generate",
            new { department = "Bilgisayar Mühendisliği" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("fitnessPercent");
    }

    // ── TS-16: What-if analizi ────────────────────────────────────────────────
    [Fact]
    public async Task TS16_WhatIf_ExcludedDays_Returns200()
    {
        var response = await _client.PostAsJsonAsync("/api/schedule/whatif", new
        {
            excludedDays = new[] { 0, 1 }, // Pazartesi-Salı kapalı
            lockedAssignments = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── TS-16b: Tüm günler kapalı → 400 ─────────────────────────────────────
    [Fact]
    public async Task TS16b_WhatIf_AllDaysClosed_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/schedule/whatif", new
        {
            excludedDays = new[] { 0, 1, 2, 3, 4 },
            lockedAssignments = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── TS-17: Program kaydetme ───────────────────────────────────────────────
    [Fact]
    public async Task TS17_SaveSchedule_WithAuth_Returns201()
    {
        await SetAuthHeaderAsync();

        var response = await _client.PostAsJsonAsync("/api/schedule/save", new
        {
            name = "2025-2026 Bahar A",
            term = "2025-2026 Bahar",
            department = "Bilgisayar Mühendisliği",
            fitnessPercent = 92.5,
            entries = new[]
            {
                new { courseId = 1, classroomId = 1, dayOfWeek = 0, startHour = 9, durationHours = 3 }
            }
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("id");
        body!["department"].ToString().Should().Be("Bilgisayar Mühendisliği");
    }

    // ── TS-17b: Token yok → 401 ───────────────────────────────────────────────
    [Fact]
    public async Task TS17b_SaveSchedule_NoToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/schedule/save", new
        {
            name = "Test",
            term = "2025-2026 Bahar",
            entries = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TS-18: Kayıtlı program listesi ───────────────────────────────────────
    [Fact]
    public async Task TS18_ListSchedules_Returns200WithDepartmentField()
    {
        var response = await _client.GetAsync("/api/schedule/list");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        list.Should().NotBeNull();
        if (list!.Count > 0)
        {
            list[0].Should().ContainKey("department");
            list[0].Should().ContainKey("fitnessPercent");
        }
    }

    // ── TS-19: Program aktivasyonu ────────────────────────────────────────────
    [Fact]
    public async Task TS19_ActivateSchedule_WithAuth_Returns204()
    {
        await SetAuthHeaderAsync();

        // Mevcut listeen ilk programı al
        var listRes = await _client.GetAsync("/api/schedule/list");
        var list = await listRes.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        list.Should().NotBeNullOrEmpty();
        var scheduleId = list![0]["id"].ToString();

        var response = await _client.PutAsync($"/api/schedule/{scheduleId}/activate", null);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // ── TS-22: Silinmiş program getirme → 404 ────────────────────────────────
    [Fact]
    public async Task TS22_GetScheduleById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/schedule/99999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
