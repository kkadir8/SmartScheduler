using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructorsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Instructors
            .Select(i => new
            {
                i.Id,
                i.Name,
                i.Title,
                i.Department,
                i.Email,
                CourseCount = i.Courses.Count,
            })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var instructor = await db.Instructors
            .Include(i => i.Courses)
            .FirstOrDefaultAsync(i => i.Id == id);
        return instructor is null ? NotFound() : Ok(instructor);
    }
}
