using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Integration;

/// <summary>TS-01 — TS-05: Auth endpoint entegrasyon testleri.</summary>
public class AuthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(TestDataSeeder.Seed);
        _client = factory.CreateClient();
    }

    // ── TS-01: Başarılı giriş ─────────────────────────────────────────────────
    [Fact]
    public async Task TS01_Login_ValidCredentials_Returns200WithToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@smartscheduler.com",
            password = "Admin123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("token");
        body!["token"].ToString().Should().NotBeNullOrEmpty();
    }

    // ── TS-02: Hatalı şifre ───────────────────────────────────────────────────
    [Fact]
    public async Task TS02_Login_WrongPassword_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@smartscheduler.com",
            password = "YanlisŞifre"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TS-03: Bilinmeyen e-posta ─────────────────────────────────────────────
    [Fact]
    public async Task TS03_Login_UnknownEmail_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "yok@example.com",
            password = "herhangi123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        // Güvenlik: "Kullanıcı bulunamadı" yerine genel hata mesajı dönmeli
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body!["message"].ToString().Should().NotContain("bulunamadı");
    }

    // ── TS-04: Başarılı kayıt ─────────────────────────────────────────────────
    [Fact]
    public async Task TS04_Register_NewEmail_Returns200WithToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "yeniKullanici",
            email = "yeni@test.com",
            password = "Test1234!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("token");
    }

    // ── TS-05: Mevcut e-posta ile kayıt ──────────────────────────────────────
    [Fact]
    public async Task TS05_Register_DuplicateEmail_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "testUser2",
            email = "admin@smartscheduler.com", // zaten mevcut
            password = "Test1234!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
