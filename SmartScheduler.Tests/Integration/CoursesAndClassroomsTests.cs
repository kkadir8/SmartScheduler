using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Integration;

/// <summary>TS-06 — TS-10: Courses ve Classrooms CRUD entegrasyon testleri.</summary>
public class CoursesAndClassroomsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CoursesAndClassroomsTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(TestDataSeeder.Seed);
        _client = factory.CreateClient();
    }

    private async Task<string> GetTokenAsync()
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@smartscheduler.com", password = "Admin123!" });
        var body = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        return body!["token"].ToString()!;
    }

    // ── TS-06: Tüm dersleri listeleme ─────────────────────────────────────────
    [Fact]
    public async Task TS06_GetCourses_Returns200WithList()
    {
        var response = await _client.GetAsync("/api/courses");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        list.Should().NotBeNullOrEmpty();
        list![0].Should().ContainKey("code");
        list![0].Should().ContainKey("name");
    }

    // ── TS-07: Var olmayan ders ID ─────────────────────────────────────────────
    [Fact]
    public async Task TS07_GetCourseById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/courses/99999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── TS-08: Token olmadan ders ekleme ──────────────────────────────────────
    [Fact]
    public async Task TS08_PostCourse_NoToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/courses", new
        {
            code = "TEST101",
            name = "Test Dersi",
            credit = 3,
            studentCount = 30,
            instructorId = 1,
            durationHours = 2
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── Ek: Token ile ders ekleme başarılı ───────────────────────────────────
    [Fact]
    public async Task PostCourse_WithToken_Returns201()
    {
        var token = await GetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/courses", new
        {
            code = "NEW999",
            name = "Yeni Ders",
            credit = 2,
            studentCount = 20,
            instructorId = 1,
            durationHours = 2
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        _client.DefaultRequestHeaders.Authorization = null;
    }

    // ── TS-09: Tüm derslikleri listeleme ──────────────────────────────────────
    [Fact]
    public async Task TS09_GetClassrooms_Returns200WithList()
    {
        var response = await _client.GetAsync("/api/classrooms");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
        list.Should().NotBeNullOrEmpty();
        list![0].Should().ContainKey("capacity");
        list![0].Should().ContainKey("name");
    }

    // ── TS-10: Var olmayan derslik güncelleme ─────────────────────────────────
    [Fact]
    public async Task TS10_PutClassroom_NotFound_Returns404()
    {
        var token = await GetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PutAsJsonAsync("/api/classrooms/99999", new
        {
            name = "A-301",
            building = "A Blok",
            capacity = 50,
            hasLab = false,
            hasProjector = true
        });

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        _client.DefaultRequestHeaders.Authorization = null;
    }
}
