using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;
using SmartScheduler.API.Services;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly GeneticAlgorithmService _algorithmService;
    private readonly AppDbContext _db;

    public ScheduleController(GeneticAlgorithmService algorithmService, AppDbContext db)
    {
        _algorithmService = algorithmService;
        _db = db;
    }

    /// <summary>Genetik algoritma ile optimum ders programı üret</summary>
    [HttpPost("generate")]
    public async Task<IActionResult> Generate()
    {
        var result = await _algorithmService.GenerateScheduleAsync();
        return Ok(BuildResponse(result));
    }

    /// <summary>
    /// What-if analizi: belirli günleri kapatarak veya dersleri sabitleyerek
    /// algoritmayı yeniden çalıştırır. Sonuç /generate ile aynı formattadır;
    /// karşılaştırmayı (diff) frontend yapar.
    /// </summary>
    [HttpPost("whatif")]
    public async Task<IActionResult> WhatIf([FromBody] WhatIfOptions options)
    {
        options ??= new WhatIfOptions();

        // En az bir çalışma günü açık kalmalı
        var openDays = Enumerable.Range(0, 5).Except(options.ExcludedDays).Any();
        if (!openDays)
            return BadRequest("En az bir çalışma günü açık olmalı. Tüm günler kapatılamaz.");

        var result = await _algorithmService.GenerateScheduleAsync(options);
        return Ok(BuildResponse(result));
    }

    /// <summary>Üretilen programı veritabanına kaydet (Schedules + ScheduleEntries).</summary>
    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SaveScheduleRequest request)
    {
        if (request is null || request.Entries.Count == 0)
            return BadRequest("Kaydedilecek program boş olamaz.");

        var schedule = new Schedule
        {
            Name = string.IsNullOrWhiteSpace(request.Name)
                ? $"Program {DateTime.UtcNow:dd.MM.yyyy HH:mm}"
                : request.Name.Trim(),
            Semester = request.Semester?.Trim() ?? string.Empty,
            FitnessScore = request.FitnessScore,
            GeneratedAt = DateTime.UtcNow,
            IsActive = false,
            Entries = request.Entries.Select(e => new ScheduleEntry
            {
                CourseId = e.CourseId,
                ClassroomId = e.ClassroomId,
                DayOfWeek = e.DayOfWeek,
                StartHour = e.StartHour,
                DurationHours = e.DurationHours <= 0 ? 2 : e.DurationHours,
            }).ToList()
        };

        _db.Schedules.Add(schedule);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, new
        {
            schedule.Id,
            schedule.Name,
            schedule.Semester,
            schedule.FitnessScore,
            schedule.GeneratedAt,
            schedule.IsActive,
            entryCount = schedule.Entries.Count
        });
    }

    /// <summary>Kayıtlı programların özet listesi (entry'siz, hafif).</summary>
    [HttpGet("list")]
    public async Task<IActionResult> List()
    {
        var schedules = await _db.Schedules
            .OrderByDescending(s => s.GeneratedAt)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Semester,
                s.FitnessScore,
                s.GeneratedAt,
                s.IsActive,
                entryCount = s.Entries.Count
            })
            .ToListAsync();

        return Ok(schedules);
    }

    /// <summary>Tek bir kayıtlı programı entry'leriyle (ders/derslik adları dahil) getir.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var schedule = await _db.Schedules
            .Include(s => s.Entries).ThenInclude(e => e.Course)
            .Include(s => s.Entries).ThenInclude(e => e.Classroom)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (schedule is null)
            return NotFound($"#{id} numaralı program bulunamadı.");

        var entries = schedule.Entries.Select(e => new
        {
            id = e.Id,
            courseId = e.CourseId,
            classroomId = e.ClassroomId,
            dayOfWeek = e.DayOfWeek,
            startHour = e.StartHour,
            durationHours = e.DurationHours,
            course = e.Course == null ? null : new { e.Course.Code, e.Course.Name },
            classroom = e.Classroom == null ? null : new { e.Classroom.Name },
        }).ToList();

        return Ok(new
        {
            schedule.Id,
            schedule.Name,
            schedule.Semester,
            schedule.FitnessScore,
            schedule.GeneratedAt,
            schedule.IsActive,
            entries
        });
    }

    /// <summary>Bir programı "aktif" işaretle; aynı anda yalnızca biri aktif olur.</summary>
    [HttpPut("{id:int}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var target = await _db.Schedules.FirstOrDefaultAsync(s => s.Id == id);
        if (target is null)
            return NotFound($"#{id} numaralı program bulunamadı.");

        var actives = await _db.Schedules.Where(s => s.IsActive).ToListAsync();
        foreach (var s in actives) s.IsActive = false;
        target.IsActive = true;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Kayıtlı bir programı sil (entry'ler cascade ile gider).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var schedule = await _db.Schedules.FirstOrDefaultAsync(s => s.Id == id);
        if (schedule is null)
            return NotFound($"#{id} numaralı program bulunamadı.");

        _db.Schedules.Remove(schedule);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>generate/whatif endpoint'lerinin ortak response gövdesi.</summary>
    private static object BuildResponse(ScheduleResult result)
    {
        var best = result.Best;

        // DayOfWeek: Monday=1..Friday=5 → frontend: 0=Pazartesi..4=Cuma
        var entries = best.Genes.Select((g, idx) => new
        {
            id = idx + 1,
            courseId = g.CourseId,
            classroomId = g.ClassroomId,
            dayOfWeek = (int)g.Day - 1,
            startHour = 8 + g.TimeSlot,
            durationHours = 2,
        }).ToList();

        return new
        {
            fitness = Math.Round(best.Fitness, 4),
            fitnessPercent = Math.Round(best.Fitness * 100, 1),
            conflictCount = (int)Math.Round((1.0 / Math.Max(best.Fitness, 0.0001)) - 1),
            bestGeneration = result.BestGeneration,
            totalGenerations = result.TotalGenerations,
            elapsedMs = result.ElapsedMs,
            stoppedEarly = result.StoppedEarly,
            fitnessHistory = result.FitnessHistory,
            entries
        };
    }
}

// --- DTO'lar (frontend ile sözleşme) ---

public class SaveScheduleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public double? FitnessScore { get; set; }
    public List<SaveScheduleEntry> Entries { get; set; } = [];
}

public class SaveScheduleEntry
{
    public int CourseId { get; set; }
    public int ClassroomId { get; set; }
    public int DayOfWeek { get; set; }   // 0=Pazartesi..4=Cuma
    public int StartHour { get; set; }   // 8..18
    public int DurationHours { get; set; } = 2;
}
