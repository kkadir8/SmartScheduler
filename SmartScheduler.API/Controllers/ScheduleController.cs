using Microsoft.AspNetCore.Mvc;
using SmartScheduler.API.Services;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly GeneticAlgorithmService _algorithmService;

    public ScheduleController(GeneticAlgorithmService algorithmService)
    {
        _algorithmService = algorithmService;
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

    /// <summary>İki endpoint'in ortak response gövdesi.</summary>
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
