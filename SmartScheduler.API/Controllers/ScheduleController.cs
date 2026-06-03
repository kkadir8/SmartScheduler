using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.DTOs;
using SmartScheduler.API.Models;
using SmartScheduler.API.Services;
using SmartScheduler.API.Services.Interfaces;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly IGeneticAlgorithmService _algorithmService;
    private readonly AppDbContext _db;

    public ScheduleController(IGeneticAlgorithmService algorithmService, AppDbContext db)
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
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Save([FromBody] SaveScheduleRequest request)
    {
        if (request is null || request.Entries.Count == 0)
            return BadRequest("Kaydedilecek program boş olamaz.");

        var schedule = new Schedule
        {
            Name = string.IsNullOrWhiteSpace(request.Name)
                ? $"Program {DateTime.UtcNow:dd.MM.yyyy HH:mm}"
                : request.Name.Trim(),
            Semester = request.Term?.Trim() ?? string.Empty,
            FitnessScore = request.FitnessPercent.HasValue ? request.FitnessPercent.Value / 100.0 : null,
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
            term = schedule.Semester,
            fitnessPercent = schedule.FitnessScore.HasValue ? Math.Round(schedule.FitnessScore.Value * 100, 1) : (double?)null,
            createdAt = schedule.GeneratedAt,
            schedule.IsActive,
            courseCount = schedule.Entries.Count
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
                term = s.Semester,
                fitnessPercent = s.FitnessScore.HasValue ? Math.Round(s.FitnessScore.Value * 100, 1) : 0.0,
                createdAt = s.GeneratedAt,
                s.IsActive,
                courseCount = s.Entries.Count
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
            term = schedule.Semester,
            fitnessPercent = schedule.FitnessScore.HasValue ? Math.Round(schedule.FitnessScore.Value * 100, 1) : 0.0,
            createdAt = schedule.GeneratedAt,
            schedule.IsActive,
            entries
        });
    }

    /// <summary>Bir programı "aktif" işaretle; aynı anda yalnızca biri aktif olur.</summary>
    [HttpPut("{id:int}/activate")]
    [Microsoft.AspNetCore.Authorization.Authorize]
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
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var schedule = await _db.Schedules.FirstOrDefaultAsync(s => s.Id == id);
        if (schedule is null)
            return NotFound($"#{id} numaralı program bulunamadı.");

        _db.Schedules.Remove(schedule);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Kayıtlı bir programdaki tek bir dersin gün/saatini günceller.</summary>
    [HttpPatch("{scheduleId:int}/entries/{entryId:int}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateEntry(int scheduleId, int entryId, [FromBody] UpdateEntryRequest request)
    {
        var entry = await _db.ScheduleEntries
            .FirstOrDefaultAsync(e => e.Id == entryId && e.ScheduleId == scheduleId);

        if (entry is null)
            return NotFound($"Kayıt bulunamadı.");

        entry.DayOfWeek = request.DayOfWeek;
        entry.StartHour = request.StartHour;
        await _db.SaveChangesAsync();

        return Ok(new { entry.Id, entry.DayOfWeek, entry.StartHour });
    }

    /// <summary>generate/whatif endpoint'lerinin ortak response gövdesi.</summary>
    private static object BuildResponse(ScheduleResult result)
    {
        var best = result.Best;

        var entries = best.Genes.Select((g, idx) => new
        {
            id = idx + 1,
            courseId = g.CourseId,
            instructorId = g.InstructorId,
            classroomId = g.ClassroomId,
            dayOfWeek = (int)g.Day - 1,
            startHour = 8 + g.TimeSlot,
            durationHours = g.DurationHours,
        }).ToList();

        // Çakışmaları 2 saatlik blok örtüşmesine göre tespit et; sayı = liste uzunluğu (tutarlı)
        var detected = DetectConflicts(best.Genes);
        int conflictCount = detected.Count;
        int capacityCount = result.CapacityCount;

        // Gösterilen fitness "geçerlilik" ölçer: hem zaman çakışması hem kapasite ihlali
        // sıfırsa %100. (Hoca müsaitliği soft tercih olarak GA'nın iç aramasında dikkate
        //  alınır ama tek bir tercih ihlali programı geçersiz yapmadığı için yüzdeyi ezmez.)
        int totalIssues = conflictCount + capacityCount;
        return new
        {
            fitness = Math.Round(1.0 / (1 + totalIssues), 4),
            fitnessPercent = Math.Round(100.0 / (1 + totalIssues), 1),
            conflictCount,
            capacityCount,
            conflicts = detected,
            bestGeneration = result.BestGeneration,
            totalGenerations = result.TotalGenerations,
            elapsedMs = result.ElapsedMs,
            stoppedEarly = result.StoppedEarly,
            fitnessHistory = result.FitnessHistory,
            entries
        };
    }

    private static List<object> DetectConflicts(IList<SmartScheduler.API.Models.Algorithm.Gene> genes)
    {
        var conflicts = new List<object>();
        var list = genes.ToList();

        // İki ders aynı gün VE zaman aralıkları kesişiyorsa çakışır.
        // Aralık örtüşmesi: startA < endB && startB < endA (her ders kendi süresince).
        // Her ders çiftini bir kez kontrol ederiz → çakışmalar tekrarsız listelenir.
        for (int i = 0; i < list.Count; i++)
        {
            for (int j = i + 1; j < list.Count; j++)
            {
                var a = list[i];
                var b = list[j];
                if (a.Day != b.Day) continue;
                bool overlap = a.TimeSlot < b.TimeSlot + b.DurationHours
                            && b.TimeSlot < a.TimeSlot + a.DurationHours;
                if (!overlap) continue;

                int day = (int)a.Day - 1;
                int hour = 8 + Math.Max(a.TimeSlot, b.TimeSlot); // örtüşmenin başladığı saat

                if (a.ClassroomId == b.ClassroomId)
                    conflicts.Add(new
                    {
                        type = "room",
                        day,
                        hour,
                        classroomId = a.ClassroomId,
                        courseIds = new[] { a.CourseId, b.CourseId }
                    });

                if (a.InstructorId != 0 && a.InstructorId == b.InstructorId)
                    conflicts.Add(new
                    {
                        type = "instructor",
                        day,
                        hour,
                        instructorId = a.InstructorId,
                        courseIds = new[] { a.CourseId, b.CourseId }
                    });
            }
        }

        return conflicts;
    }
}

