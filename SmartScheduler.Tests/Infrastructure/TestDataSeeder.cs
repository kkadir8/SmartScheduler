using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

namespace SmartScheduler.Tests.Infrastructure;

/// <summary>
/// EnsureCreated() çağrısı AppDbContext.OnModelCreating'deki HasData seed verilerini otomatik uygular.
/// (15 hoca, 20 ders, 15 derslik, 21 kısıt)
/// Bu seeder sadece HasData'da bulunmayan test verilerini ekler.
/// </summary>
public static class TestDataSeeder
{
    /// <summary>Admin kullanıcısı ekler (HasData'da kullanıcı yok).</summary>
    public static void Seed(AppDbContext db)
    {
        db.Users.Add(new AppUser
        {
            Username = "admin",
            Email = "admin@smartscheduler.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });
    }

    /// <summary>Kayıtlı program + entry ekler (HasData kurs/derslik ID'lerini kullanır).</summary>
    public static void AddScheduleWithEntries(AppDbContext db)
    {
        db.Schedules.Add(new Schedule
        {
            Name = "Test Programı",
            Semester = "2025-2026 Bahar",
            Department = "Bilgisayar Mühendisliği",
            IsActive = false,
            FitnessScore = 0.95,
            GeneratedAt = DateTime.UtcNow,
            Entries =
            [
                new ScheduleEntry { CourseId = 1, ClassroomId = 1, DayOfWeek = 0, StartHour = 9,  DurationHours = 3 },
                new ScheduleEntry { CourseId = 2, ClassroomId = 2, DayOfWeek = 1, StartHour = 13, DurationHours = 2 },
            ]
        });
    }
}
