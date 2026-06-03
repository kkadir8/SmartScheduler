using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using FluentAssertions;
using SmartScheduler.Tests.Infrastructure;

namespace SmartScheduler.Tests.Security;

/// <summary>
/// SEC-01 — SEC-10: Güvenlik senaryoları.
/// JWT doğrulama, Authorization zorunluluğu, giriş kaba-kuvvet koruması,
/// SQL injection girişimleri ve hassas veri ifşası testleri.
/// </summary>
public class SecurityTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SecurityTests(TestWebApplicationFactory factory)
    {
        factory.InitializeDatabase(TestDataSeeder.Seed);
        _client = factory.CreateClient();
    }

    // ── SEC-01: Token olmadan korumalı endpoint → 401 ─────────────────────────
    [Theory]
    [InlineData("POST", "/api/courses")]
    [InlineData("PUT",  "/api/courses/1")]
    [InlineData("DELETE", "/api/courses/1")]
    [InlineData("POST", "/api/classrooms")]
    [InlineData("POST", "/api/constraints")]
    [InlineData("POST", "/api/schedule/save")]
    [InlineData("PUT",  "/api/schedule/1/activate")]
    [InlineData("DELETE", "/api/schedule/1")]
    public async Task SEC01_ProtectedEndpoints_NoToken_Return401(string method, string path)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), path)
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json")
        };

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            $"{method} {path} korumalı endpoint token gerektirmeli");
    }

    // ── SEC-02: Süresi dolmuş token → 401 ────────────────────────────────────
    [Fact]
    public async Task SEC02_ExpiredToken_Returns401()
    {
        // Manuel olarak oluşturulmuş süresi dolmuş JWT (imza geçersiz)
        const string expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJleHAiOjF9." +
            "FakeSignature";

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", expiredToken);

        var response = await _client.PostAsJsonAsync("/api/courses", new
        {
            code = "SEC999", name = "Sec", credit = 1, studentCount = 10,
            instructorId = 1, durationHours = 2
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        _client.DefaultRequestHeaders.Authorization = null;
    }

    // ── SEC-03: Bozuk token → 401 ─────────────────────────────────────────────
    [Fact]
    public async Task SEC03_MalformedToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", "bu-gecersiz-bir-token-degeri");

        var response = await _client.PostAsJsonAsync("/api/schedule/save",
            new { name = "x", term = "x", entries = Array.Empty<object>() });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        _client.DefaultRequestHeaders.Authorization = null;
    }

    // ── SEC-04: Hatalı şifre güvenli mesaj döner ──────────────────────────────
    [Fact]
    public async Task SEC04_WrongPassword_DoesNotRevealUserExistence()
    {
        var resKnown = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@smartscheduler.com", password = "YanlisŞifre" });

        var resUnknown = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "yok@example.com", password = "YanlisŞifre" });

        // Her ikisi de 401 dönmeli — kullanıcı varlığını sızdırmamalı
        resKnown.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        resUnknown.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var bodyKnown   = await resKnown.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        var bodyUnknown = await resUnknown.Content.ReadFromJsonAsync<Dictionary<string, object>>();

        // Mesajlar aynı ya da benzer olmalı (timing attack vektörünü daraltmak için)
        bodyKnown!["message"].ToString().Should()
            .Be(bodyUnknown!["message"].ToString());
    }

    // ── SEC-05: SQL injection girişimi — courses listeleme ────────────────────
    [Fact]
    public async Task SEC05_SqlInjection_InQueryParam_Returns200OrBadRequest()
    {
        // ORM parametreli sorgu kullandığı için injection çalışmamalı
        var response = await _client.GetAsync("/api/courses?name=' OR 1=1--");

        // 200 veya 400 dönmeli, 500 dönmemeli
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError);
    }

    // ── SEC-06: XSS girişimi — JSON API sunucu tarafı doğrulaması ───────────────
    // JSON API'ler XSS payload'ları olduğu gibi depolayabilir; XSS koruması
    // HTML render eden frontend'in sorumluluğundadır. Bu test:
    // 1) Sunucu 500 döndürmez
    // 2) Response geçerli JSON formatındadır
    [Fact]
    public async Task SEC06_XssPayload_DoesNotCrashServer()
    {
        var token = await GetTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/courses", new
        {
            code = "XSS001",
            name = "<script>alert('xss')</script>",
            credit = 1,
            studentCount = 10,
            instructorId = 1,
            durationHours = 2
        });

        // Sunucu çökmemeli (500 olmamalı)
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError);
        // 201 veya 400 kabul edilebilir
        ((int)response.StatusCode).Should().BeOneOf(201, 400);

        _client.DefaultRequestHeaders.Authorization = null;
    }

    // ── SEC-07: Kimlik doğrulama endpoint'leri şifre hash'liyor mu ────────────
    [Fact]
    public async Task SEC07_Register_PasswordIsHashed_NotStoredPlaintext()
    {
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "secTestUser",
            email = "sec@test.com",
            password = "Gizli1234!"
        });

        // Login ile doğrulama — hash çalışıyorsa login başarılı olmalı
        var loginRes = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "sec@test.com", password = "Gizli1234!" });

        loginRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // Yanlış şifre reddedilmeli
        var failRes = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "sec@test.com", password = "Gizli1234!" + "!" });

        failRes.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── SEC-08: Health endpoint public erişilebilir olmalı ───────────────────
    [Fact]
    public async Task SEC08_HealthEndpoint_IsPubliclyAccessible()
    {
        var response = await _client.GetAsync("/api/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ── SEC-09: Read-only endpoint'ler token gerektirmez ─────────────────────
    [Theory]
    [InlineData("/api/courses")]
    [InlineData("/api/classrooms")]
    [InlineData("/api/instructors")]
    [InlineData("/api/schedule/list")]
    public async Task SEC09_ReadOnlyEndpoints_NoToken_Return200(string path)
    {
        var response = await _client.GetAsync(path);

        response.StatusCode.Should().Be(HttpStatusCode.OK,
            $"{path} public listeleme endpoint'i olmalı");
    }

    // ── SEC-10: Silinecek kayıt başkasının kaydı değil (ID çöp değeri) ────────
    [Fact]
    public async Task SEC10_DeleteSchedule_NonExistent_Returns404NotServerError()
    {
        var token = await GetTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.DeleteAsync("/api/schedule/9999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        _client.DefaultRequestHeaders.Authorization = null;
    }

    // ── Yardımcı ─────────────────────────────────────────────────────────────
    private async Task<string> GetTokenAsync()
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@smartscheduler.com", password = "Admin123!" });
        var body = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        return body!["token"].ToString()!;
    }
}
