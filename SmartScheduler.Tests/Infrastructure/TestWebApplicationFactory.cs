using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmartScheduler.API.Data;

namespace SmartScheduler.Tests.Infrastructure;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";
    private bool _seeded;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // ConfigureTestServices: app servislerinden SONRA çalışır — provider çakışması önlenir
        builder.ConfigureTestServices(services =>
        {
            // DbContextOptions ve AppDbContext kayıtlarını temizle
            var toRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                         || d.ServiceType == typeof(AppDbContext))
                .ToList();
            foreach (var d in toRemove) services.Remove(d);

            // In-memory veritabanı ekle (test izolasyonu için unique isim)
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }

    /// <summary>Veritabanını oluşturur ve test verilerini seed eder. Birden fazla çağrıda idempotent.</summary>
    public void InitializeDatabase(Action<AppDbContext>? seed = null)
    {
        if (_seeded) return;
        _seeded = true;

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        seed?.Invoke(db);
        db.SaveChanges();
    }
}
