using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Integration;

/// <summary>TS-11 — TS-14: Constraints endpoint entegrasyon testleri.</summary>
public class ConstraintsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ConstraintsTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(TestDataSeeder.Seed);
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

    // ── TS-11: Yeni kısıt oluşturma ───────────────────────────────────────────
    [Fact]
    public async Task TS11_PostConstraint_Valid_Returns201()
    {
        await SetAuthHeaderAsync();

        var response = await _client.PostAsJsonAsync("/api/constraints", new
        {
            courseId = 1,
            classroomId = 1,
            notes = "Sadece bu sınıfta yapılabilir"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("id");
    }

    // ── TS-12: Mükerrer kısıt ────────────────────────────────────────────────
    [Fact]
    public async Task TS12_PostConstraint_Duplicate_Returns409()
    {
        await SetAuthHeaderAsync();

        // İlk ekle
        await _client.PostAsJsonAsync("/api/constraints",
            new { courseId = 2, classroomId = 2, notes = "İlk" });

        // Aynı çifti tekrar ekle
        var response = await _client.PostAsJsonAsync("/api/constraints",
            new { courseId = 2, classroomId = 2, notes = "Tekrar" });

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    // ── TS-13: Geçersiz CourseId ──────────────────────────────────────────────
    [Fact]
    public async Task TS13_PostConstraint_InvalidCourseId_Returns400()
    {
        await SetAuthHeaderAsync();

        var response = await _client.PostAsJsonAsync("/api/constraints", new
        {
            courseId = 99999,
            classroomId = 1,
            notes = "Geçersiz ders"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── TS-14: Belirli derse ait kısıtları listeleme ─────────────────────────
    [Fact]
    public async Task TS14_GetConstraintsByCourse_Returns200()
    {
        var response = await _client.GetAsync("/api/constraints/course/1");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        list.Should().NotBeNull();
    }
}
