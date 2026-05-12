using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClassroomsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Classrooms
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Building,
                c.Capacity,
                c.HasLab,
                c.HasProjector,
            })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var classroom = await db.Classrooms.FindAsync(id);
        return classroom is null ? NotFound() : Ok(classroom);
    }
}
