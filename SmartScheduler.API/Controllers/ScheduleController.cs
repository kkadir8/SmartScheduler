using Microsoft.AspNetCore.Authorization;
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

        var response = new
        {
            fitness = Math.Round(best.Fitness, 4),
            fitnessPercent = Math.Round(best.Fitness * 100, 1),
            conflictCount = (int)Math.Round((1.0 / Math.Max(best.Fitness, 0.0001)) - 1),
            bestGeneration = result.BestGeneration,
            totalGenerations = result.TotalGenerations,
            fitnessHistory = result.FitnessHistory,
            entries
        };

        return Ok(response);
    }
}
