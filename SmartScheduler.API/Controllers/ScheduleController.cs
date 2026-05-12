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
    [Authorize]
    public async Task<IActionResult> Generate()
    {
        var result = await _algorithmService.GenerateScheduleAsync();

        var response = new
        {
            fitness = Math.Round(result.Fitness, 4),
            conflictCount = (int)Math.Round((1.0 / result.Fitness) - 1),
            geneCount = result.Genes.Count,
            schedule = result.Genes.Select(g => new
            {
                courseId = g.CourseId,
                instructorId = g.InstructorId,
                classroomId = g.ClassroomId,
                day = g.Day.ToString(),
                timeSlot = g.TimeSlot,
                time = $"{8 + g.TimeSlot}:00"
            })
        };

        return Ok(response);
    }
}
