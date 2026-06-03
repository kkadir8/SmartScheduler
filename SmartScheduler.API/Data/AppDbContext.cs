using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Instructor>   Instructors    => Set<Instructor>();
    public DbSet<Course>       Courses        => Set<Course>();
    public DbSet<Classroom>    Classrooms     => Set<Classroom>();
    public DbSet<Schedule>     Schedules      => Set<Schedule>();
    public DbSet<ScheduleEntry> ScheduleEntries => Set<ScheduleEntry>();
    public DbSet<AppUser>      Users          => Set<AppUser>();
    public DbSet<Constraint>            Constraints             => Set<Constraint>();
    public DbSet<InstructorAvailability> InstructorAvailabilities => Set<InstructorAvailability>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Instructor ──────────────────────────────────────────────────
        modelBuilder.Entity<Instructor>(e =>
        {
            e.HasIndex(i => i.Email).IsUnique();
        });

        // ── InstructorAvailability ───────────────────────────────────────
        modelBuilder.Entity<InstructorAvailability>(e =>
        {
            e.HasOne(a => a.Instructor)
             .WithMany(i => i.Availabilities)
             .HasForeignKey(a => a.InstructorId)
             .OnDelete(DeleteBehavior.Cascade);

            // Aynı hoca için aynı gün/saat çifti bir kez tanımlanabilir
            e.HasIndex(a => new { a.InstructorId, a.DayOfWeek, a.Hour }).IsUnique();
        });

        // ── Course ──────────────────────────────────────────────────────
        modelBuilder.Entity<Course>(e =>
        {
            e.HasIndex(c => c.Code).IsUnique();
            e.HasOne(c => c.Instructor)
             .WithMany(i => i.Courses)
             .HasForeignKey(c => c.InstructorId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ScheduleEntry ────────────────────────────────────────────────
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

        // ── Constraint ───────────────────────────────────────────────────
        modelBuilder.Entity<Constraint>(e =>
        {
            e.HasOne(c => c.Course)
             .WithMany(c => c.Constraints)
             .HasForeignKey(c => c.CourseId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Classroom)
             .WithMany(c => c.Constraints)
             .HasForeignKey(c => c.ClassroomId)
             .OnDelete(DeleteBehavior.Cascade);

            // Aynı ders-derslik çifti bir kez tanımlanabilir
            e.HasIndex(c => new { c.CourseId, c.ClassroomId }).IsUnique();
        });

        // ════════════════════════════════════════════════════════════════
        //  SEED DATA
        // ════════════════════════════════════════════════════════════════

        // ── Instructors (15 kayıt) ───────────────────────────────────────
        var dt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Instructor>().HasData(
            new Instructor { Id = 1,  Name = "Ahmet Yılmaz",    Title = "Prof. Dr.",       Department = "Bilgisayar Mühendisliği",          Email = "ahmet.yilmaz@uni.edu.tr",   CreatedAt = dt },
            new Instructor { Id = 2,  Name = "Ayşe Kaya",       Title = "Doç. Dr.",        Department = "Bilgisayar Mühendisliği",          Email = "ayse.kaya@uni.edu.tr",      CreatedAt = dt },
            new Instructor { Id = 3,  Name = "Mehmet Demir",    Title = "Dr. Öğr. Üyesi", Department = "Bilgisayar Mühendisliği",          Email = "mehmet.demir@uni.edu.tr",   CreatedAt = dt },
            new Instructor { Id = 4,  Name = "Fatma Şahin",     Title = "Doç. Dr.",        Department = "Bilgisayar Mühendisliği",          Email = "fatma.sahin@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 5,  Name = "Ali Çelik",       Title = "Prof. Dr.",       Department = "Elektrik-Elektronik Müh.",         Email = "ali.celik@uni.edu.tr",      CreatedAt = dt },
            new Instructor { Id = 6,  Name = "Zeynep Arslan",   Title = "Dr. Öğr. Üyesi", Department = "Bilgisayar Mühendisliği",          Email = "zeynep.arslan@uni.edu.tr",  CreatedAt = dt },
            new Instructor { Id = 7,  Name = "Hasan Kılıç",     Title = "Doç. Dr.",        Department = "Matematik",                        Email = "hasan.kilic@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 8,  Name = "Elif Yıldız",     Title = "Dr. Öğr. Üyesi", Department = "Bilgisayar Mühendisliği",          Email = "elif.yildiz@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 9,  Name = "Mustafa Öztürk",  Title = "Prof. Dr.",       Department = "Bilgisayar Mühendisliği",          Email = "mustafa.ozturk@uni.edu.tr", CreatedAt = dt },
            new Instructor { Id = 10, Name = "Selin Aydın",     Title = "Dr. Öğr. Üyesi", Department = "Endüstri Mühendisliği",            Email = "selin.aydin@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 11, Name = "Burak Güneş",     Title = "Doç. Dr.",        Department = "Bilgisayar Mühendisliği",          Email = "burak.gunes@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 12, Name = "Merve Koç",       Title = "Dr. Öğr. Üyesi", Department = "Bilgisayar Mühendisliği",          Email = "merve.koc@uni.edu.tr",      CreatedAt = dt },
            new Instructor { Id = 13, Name = "Emre Yılmaz",     Title = "Prof. Dr.",       Department = "Yazılım Mühendisliği",             Email = "emre.yilmaz@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 14, Name = "Ceren Doğan",     Title = "Dr. Öğr. Üyesi", Department = "Bilgisayar Mühendisliği",          Email = "ceren.dogan@uni.edu.tr",    CreatedAt = dt },
            new Instructor { Id = 15, Name = "Tarık Şen",       Title = "Doç. Dr.",        Department = "Bilgisayar Mühendisliği",          Email = "tarik.sen@uni.edu.tr",      CreatedAt = dt }
        );

        // ── Courses (20 kayıt) ───────────────────────────────────────────
        modelBuilder.Entity<Course>().HasData(
            new Course { Id = 1,  Code = "CS301", Name = "Yazılım Mühendisliği",        Credit = 3, DurationHours = 3, StudentCount = 60, InstructorId = 1,  CreatedAt = dt },
            new Course { Id = 2,  Code = "CS302", Name = "Veri Tabanı Sistemleri",      Credit = 4, DurationHours = 3, StudentCount = 45, InstructorId = 2,  CreatedAt = dt },
            new Course { Id = 3,  Code = "CS303", Name = "Algoritma Analizi",           Credit = 3, DurationHours = 2, StudentCount = 55, InstructorId = 3,  CreatedAt = dt },
            new Course { Id = 4,  Code = "CS304", Name = "Yapay Zeka",                 Credit = 3, DurationHours = 2, StudentCount = 40, InstructorId = 1,  CreatedAt = dt },
            new Course { Id = 5,  Code = "CS305", Name = "Bilgisayar Ağları",           Credit = 4, DurationHours = 3, StudentCount = 50, InstructorId = 4,  CreatedAt = dt },
            new Course { Id = 6,  Code = "CS306", Name = "İşletim Sistemleri",          Credit = 3, DurationHours = 2, StudentCount = 65, InstructorId = 5,  CreatedAt = dt },
            new Course { Id = 7,  Code = "CS307", Name = "Veri Yapıları",               Credit = 4, DurationHours = 4, StudentCount = 70, InstructorId = 9,  CreatedAt = dt },
            new Course { Id = 8,  Code = "CS308", Name = "Nesne Yönelimli Programlama", Credit = 3, DurationHours = 3, StudentCount = 55, InstructorId = 6,  CreatedAt = dt },
            new Course { Id = 9,  Code = "CS309", Name = "Web Programlama",             Credit = 3, DurationHours = 2, StudentCount = 35, InstructorId = 8,  CreatedAt = dt },
            new Course { Id = 10, Code = "CS310", Name = "Mobil Uygulama Geliştirme",   Credit = 3, DurationHours = 2, StudentCount = 35, InstructorId = 11, CreatedAt = dt },
            new Course { Id = 11, Code = "CS311", Name = "Makine Öğrenmesi",            Credit = 4, DurationHours = 3, StudentCount = 35, InstructorId = 2,  CreatedAt = dt },
            new Course { Id = 12, Code = "CS312", Name = "Siber Güvenlik",              Credit = 3, DurationHours = 2, StudentCount = 30, InstructorId = 13, CreatedAt = dt },
            new Course { Id = 13, Code = "CS313", Name = "Bulut Bilişim",               Credit = 3, DurationHours = 2, StudentCount = 38, InstructorId = 14, CreatedAt = dt },
            new Course { Id = 14, Code = "CS314", Name = "Derin Öğrenme",               Credit = 4, DurationHours = 3, StudentCount = 25, InstructorId = 2,  CreatedAt = dt },
            new Course { Id = 15, Code = "CS315", Name = "Sistem Programlama",          Credit = 3, DurationHours = 2, StudentCount = 50, InstructorId = 3,  CreatedAt = dt },
            new Course { Id = 16, Code = "CS316", Name = "Derleyici Tasarımı",          Credit = 3, DurationHours = 3, StudentCount = 35, InstructorId = 7,  CreatedAt = dt },
            new Course { Id = 17, Code = "CS317", Name = "Paralel Programlama",         Credit = 3, DurationHours = 2, StudentCount = 30, InstructorId = 15, CreatedAt = dt },
            new Course { Id = 18, Code = "CS318", Name = "Bilgisayar Grafikleri",       Credit = 3, DurationHours = 2, StudentCount = 40, InstructorId = 12, CreatedAt = dt },
            new Course { Id = 19, Code = "CS319", Name = "Gömülü Sistemler",            Credit = 4, DurationHours = 3, StudentCount = 25, InstructorId = 5,  CreatedAt = dt },
            new Course { Id = 20, Code = "CS320", Name = "Proje Yönetimi",              Credit = 2, DurationHours = 1, StudentCount = 80, InstructorId = 10, CreatedAt = dt }
        );

        // ── Classrooms (15 kayıt) ────────────────────────────────────────
        modelBuilder.Entity<Classroom>().HasData(
            new Classroom { Id = 1,  Name = "D-101",   Building = "D Blok",             Capacity = 60,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 2,  Name = "D-201",   Building = "D Blok",             Capacity = 40,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 3,  Name = "LAB-1",   Building = "Laboratuvar Binası", Capacity = 30,  HasLab = true,  HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 4,  Name = "A-105",   Building = "A Blok",             Capacity = 80,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 5,  Name = "LAB-2",   Building = "Laboratuvar Binası", Capacity = 25,  HasLab = true,  HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 6,  Name = "B-301",   Building = "B Blok",             Capacity = 50,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 7,  Name = "C-102",   Building = "C Blok",             Capacity = 45,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 8,  Name = "AMFİ-1",  Building = "Amfi Binası",        Capacity = 150, HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 9,  Name = "LAB-3",   Building = "Laboratuvar Binası", Capacity = 35,  HasLab = true,  HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 10, Name = "D-102",   Building = "D Blok",             Capacity = 55,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 11, Name = "A-201",   Building = "A Blok",             Capacity = 70,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 12, Name = "LAB-4",   Building = "Laboratuvar Binası", Capacity = 20,  HasLab = true,  HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 13, Name = "B-102",   Building = "B Blok",             Capacity = 40,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 14, Name = "C-201",   Building = "C Blok",             Capacity = 60,  HasLab = false, HasProjector = true, CreatedAt = dt },
            new Classroom { Id = 15, Name = "AMFİ-2",  Building = "Amfi Binası",        Capacity = 100, HasLab = false, HasProjector = true, CreatedAt = dt }
        );

        // ── Constraints (21 kayıt) ───────────────────────────────────────
        // Kural: Lab dersleri → sadece lab derslikler
        //        Büyük dersler (65+ öğrenci) → amfi/büyük sınıflar
        modelBuilder.Entity<Constraint>().HasData(
            // CS309 Web Programlama (45 öğrenci) → LAB-1, LAB-3, LAB-4
            new Constraint { Id = 1,  CourseId = 9,  ClassroomId = 3,  Notes = "Lab bilgisayarı gerektirir", CreatedAt = dt },
            new Constraint { Id = 2,  CourseId = 9,  ClassroomId = 9,  Notes = "Lab bilgisayarı gerektirir", CreatedAt = dt },
            new Constraint { Id = 3,  CourseId = 9,  ClassroomId = 12, Notes = "Lab bilgisayarı gerektirir", CreatedAt = dt },

            // CS310 Mobil Uygulama (35 öğrenci) → LAB-1, LAB-2, LAB-3
            new Constraint { Id = 4,  CourseId = 10, ClassroomId = 3,  Notes = "Mobil geliştirme ortamı gerektirir", CreatedAt = dt },
            new Constraint { Id = 5,  CourseId = 10, ClassroomId = 5,  Notes = "Mobil geliştirme ortamı gerektirir", CreatedAt = dt },
            new Constraint { Id = 6,  CourseId = 10, ClassroomId = 9,  Notes = "Mobil geliştirme ortamı gerektirir", CreatedAt = dt },

            // CS311 Makine Öğrenmesi (40 öğrenci) → LAB-3, LAB-4
            new Constraint { Id = 7,  CourseId = 11, ClassroomId = 9,  Notes = "GPU destekli lab gerektirir", CreatedAt = dt },
            new Constraint { Id = 8,  CourseId = 11, ClassroomId = 12, Notes = "GPU destekli lab gerektirir", CreatedAt = dt },

            // CS312 Siber Güvenlik (30 öğrenci) → LAB-1, LAB-2
            new Constraint { Id = 9,  CourseId = 12, ClassroomId = 3,  Notes = "İzole ağ ortamı gerektirir", CreatedAt = dt },
            new Constraint { Id = 10, CourseId = 12, ClassroomId = 5,  Notes = "İzole ağ ortamı gerektirir", CreatedAt = dt },

            // CS314 Derin Öğrenme (25 öğrenci) → LAB-2, LAB-4
            new Constraint { Id = 11, CourseId = 14, ClassroomId = 5,  Notes = "GPU lab gerektirir", CreatedAt = dt },
            new Constraint { Id = 12, CourseId = 14, ClassroomId = 12, Notes = "GPU lab gerektirir", CreatedAt = dt },

            // CS319 Gömülü Sistemler (28 öğrenci) → LAB-2, LAB-4
            new Constraint { Id = 13, CourseId = 19, ClassroomId = 5,  Notes = "Donanım lab gerektirir", CreatedAt = dt },
            new Constraint { Id = 14, CourseId = 19, ClassroomId = 12, Notes = "Donanım lab gerektirir", CreatedAt = dt },

            // CS306 İşletim Sistemleri (65 öğrenci) → A-105, A-201, AMFİ-1
            new Constraint { Id = 15, CourseId = 6,  ClassroomId = 4,  Notes = "Yüksek kapasiteli sınıf gerektirir", CreatedAt = dt },
            new Constraint { Id = 16, CourseId = 6,  ClassroomId = 11, Notes = "Yüksek kapasiteli sınıf gerektirir", CreatedAt = dt },
            new Constraint { Id = 17, CourseId = 6,  ClassroomId = 8,  Notes = "Yüksek kapasiteli sınıf gerektirir", CreatedAt = dt },

            // CS307 Veri Yapıları (70 öğrenci) → A-105, AMFİ-1
            new Constraint { Id = 18, CourseId = 7,  ClassroomId = 4,  Notes = "Yüksek kapasiteli sınıf gerektirir", CreatedAt = dt },
            new Constraint { Id = 19, CourseId = 7,  ClassroomId = 8,  Notes = "Yüksek kapasiteli sınıf gerektirir", CreatedAt = dt },

            // CS320 Proje Yönetimi (80 öğrenci) → AMFİ-1, AMFİ-2
            new Constraint { Id = 20, CourseId = 20, ClassroomId = 8,  Notes = "Amfi gerektirir", CreatedAt = dt },
            new Constraint { Id = 21, CourseId = 20, ClassroomId = 15, Notes = "Amfi gerektirir", CreatedAt = dt }
        );

        // ── InstructorAvailability seed (örnek müsaitlik) ────────────────
        // Örnek olarak iki hocanın haftalık müsaitlik penceresi tanımlanır.
        // Algoritma bu hocaların derslerini müsait gün/saatlere yerleştirmeyi tercih eder
        // (soft kısıt). Saatler 08:00–17:00 — 2 saatlik ders en geç 16:00'da başlar.
        var availability = new List<InstructorAvailability>();
        int avId = 1;
        void AddAvail(int instructorId, int[] days)
        {
            foreach (var d in days)
                for (int h = 8; h <= 17; h++)
                    availability.Add(new InstructorAvailability
                    {
                        Id = avId++, InstructorId = instructorId, DayOfWeek = d, Hour = h
                    });
        }
        AddAvail(1, new[] { 0, 1, 2 });  // Ahmet Yılmaz: Pazartesi–Çarşamba müsait
        AddAvail(3, new[] { 2, 3, 4 });  // Mehmet Demir: Çarşamba–Cuma müsait
        modelBuilder.Entity<InstructorAvailability>().HasData(availability);
    }
}
