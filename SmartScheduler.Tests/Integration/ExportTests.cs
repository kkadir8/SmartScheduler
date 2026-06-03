using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Integration;

/// <summary>TS-20: Export endpoint entegrasyon testleri.</summary>
public class ExportTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ExportTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(db =>
        {
            TestDataSeeder.Seed(db);
            TestDataSeeder.AddScheduleWithEntries(db);
        });
        _client = factory.CreateClient();
    }

    private async Task<string> GetFirstScheduleIdAsync()
    {
        var list = await _client.GetAsync("/api/schedule/list");
        var items = await list.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        return items![0]["id"].ToString()!;
    }

    // ── TS-20: Kayıtlı programı Excel olarak indirme ──────────────────────────
    [Fact]
    public async Task TS20_ExportScheduleExcel_ValidId_Returns200WithXlsx()
    {
        var id = await GetFirstScheduleIdAsync();
        var response = await _client.GetAsync($"/api/export/schedules/{id}/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should()
            .Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        var bytes = await response.Content.ReadAsByteArrayAsync();
        bytes.Length.Should().BeGreaterThan(0);
    }

    // ── TS-20b: Var olmayan program → 404 ────────────────────────────────────
    [Fact]
    public async Task TS20b_ExportScheduleExcel_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/export/schedules/99999/excel");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── PDF export ────────────────────────────────────────────────────────────
    [Fact]
    public async Task ExportSchedulePdf_ValidId_Returns200WithPdf()
    {
        var id = await GetFirstScheduleIdAsync();
        var response = await _client.GetAsync($"/api/export/schedules/{id}/pdf");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/pdf");
    }

    // ── Courses Excel export ──────────────────────────────────────────────────
    [Fact]
    public async Task ExportCoursesExcel_Returns200()
    {
        var response = await _client.GetAsync("/api/export/courses/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── Instructors Excel export ──────────────────────────────────────────────
    [Fact]
    public async Task ExportInstructorsExcel_Returns200()
    {
        var response = await _client.GetAsync("/api/export/instructors/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
