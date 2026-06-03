using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;
using SmartScheduler.API.Services;

namespace SmartScheduler.Tests.Unit;

/// <summary>
/// UT-11 — UT-15: GeneticAlgorithmService davranışlarını tamamen boş in-memory DB ile doğrular.
/// EnsureCreated çağrılmadığı için HasData seed verisi uygulanmaz — her test izole ve kontrollüdür.
/// </summary>
public class GeneticAlgorithmServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GeneticAlgorithmService _service;

    public GeneticAlgorithmServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"GATest_{Guid.NewGuid()}")
            .Options;
        _db = new AppDbContext(options);
        // EnsureCreated çağrılmıyor — HasData seed verisi uygulanmaz
        _service = new GeneticAlgorithmService(_db);
    }

    // ── UT-11: Ders/derslik yoksa boş sonuç dönmeli ──────────────────────────
    [Fact]
    public async Task Generate_EmptyDatabase_ReturnsEmptyResult()
    {
        // DB tamamen boş (HasData uygulanmadı)
        var result = await _service.GenerateScheduleAsync();

        result.Should().NotBeNull();
        result.Best.Genes.Should().BeEmpty();
    }

    // ── UT-12: Bölüm filtresi — sadece o bölümün dersleri seçilmeli ──────────
    [Fact]
    public async Task Generate_WithDepartmentFilter_OnlyIncludesThatDepartment()
    {
        SeedMultiDepartmentData();

        var result = await _service.GenerateScheduleAsync("BM");

        result.Best.Genes.Should().NotBeEmpty();
        var courseIds = result.Best.Genes.Select(g => g.CourseId).Distinct().ToList();
        courseIds.Should().OnlyContain(id => id == 1 || id == 2); // BM dersleri
    }

    // ── UT-13: null department — tüm dersler dahil edilmeli ──────────────────
    [Fact]
    public async Task Generate_NullDepartment_IncludesAllCourses()
    {
        SeedMultiDepartmentData();

        var result = await _service.GenerateScheduleAsync(null);

        result.Best.Genes.Should().HaveCount(3); // 2 BM + 1 YM dersi
    }

    // ── UT-14: WhatIf excludedDays — kapalı günde ders atanmamalı ─────────────
    [Fact]
    public async Task Generate_WithExcludedDays_NoDayOnExcludedDay()
    {
        SeedSingleDepartmentData();

        var options = new WhatIfOptions { ExcludedDays = [0, 1, 2, 3] }; // sadece Cuma açık
        var result = await _service.GenerateScheduleAsync(null, options);

        // Gene.Day: Monday=1...Friday=5; index = (int)Day - 1
        result.Best.Genes.Should().OnlyContain(g => (int)g.Day - 1 == 4);
    }

    // ── UT-15: Fitness 0–1 aralığında olmalı ─────────────────────────────────
    [Fact]
    public async Task Generate_FitnessScore_InValidRange()
    {
        SeedSingleDepartmentData();

        var result = await _service.GenerateScheduleAsync();

        result.Best.Fitness.Should().BeInRange(0.0, 1.0);
    }

    // ── Seed yardımcıları ─────────────────────────────────────────────────────

    private void SeedMultiDepartmentData()
    {
        _db.Instructors.AddRange(
            new Instructor { Id = 1, Name = "Ahmet", Title = "Prof.", Department = "BM", Email = "a@u.edu", CreatedAt = DateTime.UtcNow },
            new Instructor { Id = 2, Name = "Mehmet", Title = "Doç.", Department = "YM", Email = "m@u.edu", CreatedAt = DateTime.UtcNow }
        );
        _db.Classrooms.Add(new Classroom { Id = 1, Name = "D-101", Capacity = 60, HasLab = false, HasProjector = true, CreatedAt = DateTime.UtcNow });
        _db.Courses.AddRange(
            new Course { Id = 1, Code = "CS301", Name = "Yazılım", Credit = 3, DurationHours = 2, StudentCount = 30, InstructorId = 1, CreatedAt = DateTime.UtcNow },
            new Course { Id = 2, Code = "CS302", Name = "VT",      Credit = 3, DurationHours = 2, StudentCount = 25, InstructorId = 1, CreatedAt = DateTime.UtcNow },
            new Course { Id = 3, Code = "SW301", Name = "Test",    Credit = 2, DurationHours = 2, StudentCount = 20, InstructorId = 2, CreatedAt = DateTime.UtcNow }
        );
        _db.SaveChanges();
    }

    private void SeedSingleDepartmentData()
    {
        _db.Instructors.Add(new Instructor { Id = 10, Name = "Test Hoca", Title = "Dr.", Department = "BM", Email = "t@u.edu", CreatedAt = DateTime.UtcNow });
        _db.Classrooms.Add(new Classroom { Id = 10, Name = "T-101", Capacity = 60, HasLab = false, HasProjector = true, CreatedAt = DateTime.UtcNow });
        _db.Courses.Add(new Course { Id = 10, Code = "T301", Name = "Test", Credit = 3, DurationHours = 2, StudentCount = 20, InstructorId = 10, CreatedAt = DateTime.UtcNow });
        _db.SaveChanges();
    }

    public void Dispose() => _db.Dispose();
}
