using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Classroom> Classrooms => Set<Classroom>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<ScheduleEntry> ScheduleEntries => Set<ScheduleEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Instructor>(e =>
        {
            e.HasIndex(i => i.Email).IsUnique();
        });

        modelBuilder.Entity<Course>(e =>
        {
            e.HasIndex(c => c.Code).IsUnique();
            e.HasOne(c => c.Instructor)
             .WithMany(i => i.Courses)
             .HasForeignKey(c => c.InstructorId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ScheduleEntry>(e =>
        {
            e.HasOne(se => se.Schedule)
             .WithMany(s => s.Entries)
             .HasForeignKey(se => se.ScheduleId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(se => se.Course)
             .WithMany(c => c.ScheduleEntries)
             .HasForeignKey(se => se.CourseId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(se => se.Classroom)
             .WithMany(c => c.ScheduleEntries)
             .HasForeignKey(se => se.ClassroomId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed data
        modelBuilder.Entity<Instructor>().HasData(
            new Instructor { Id = 1, Name = "Ahmet Yılmaz",   Title = "Prof. Dr.",          Department = "Bilgisayar Mühendisliği", Email = "ahmet.yilmaz@uni.edu.tr",  CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Instructor { Id = 2, Name = "Ayşe Kaya",      Title = "Doç. Dr.",           Department = "Bilgisayar Mühendisliği", Email = "ayse.kaya@uni.edu.tr",      CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Instructor { Id = 3, Name = "Mehmet Demir",   Title = "Dr. Öğr. Üyesi",    Department = "Bilgisayar Mühendisliği", Email = "mehmet.demir@uni.edu.tr",   CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Instructor { Id = 4, Name = "Fatma Şahin",    Title = "Doç. Dr.",           Department = "Bilgisayar Mühendisliği", Email = "fatma.sahin@uni.edu.tr",    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Course>().HasData(
            new Course { Id = 1, Code = "CS301", Name = "Yazılım Mühendisliği",     Credit = 3, StudentCount = 60, InstructorId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Course { Id = 2, Code = "CS302", Name = "Veri Tabanı Sistemleri",   Credit = 4, StudentCount = 45, InstructorId = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Course { Id = 3, Code = "CS303", Name = "Algoritma Analizi",        Credit = 3, StudentCount = 55, InstructorId = 3, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Course { Id = 4, Code = "CS304", Name = "Yapay Zeka",               Credit = 3, StudentCount = 40, InstructorId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Course { Id = 5, Code = "CS305", Name = "Bilgisayar Ağları",        Credit = 4, StudentCount = 50, InstructorId = 4, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Classroom>().HasData(
            new Classroom { Id = 1, Name = "D-101",  Building = "D Blok",             Capacity = 60, HasLab = false, HasProjector = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Classroom { Id = 2, Name = "D-201",  Building = "D Blok",             Capacity = 40, HasLab = false, HasProjector = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Classroom { Id = 3, Name = "LAB-1",  Building = "Laboratuvar Binası", Capacity = 30, HasLab = true,  HasProjector = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Classroom { Id = 4, Name = "A-105",  Building = "A Blok",             Capacity = 80, HasLab = false, HasProjector = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Classroom { Id = 5, Name = "LAB-2",  Building = "Laboratuvar Binası", Capacity = 25, HasLab = true,  HasProjector = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
