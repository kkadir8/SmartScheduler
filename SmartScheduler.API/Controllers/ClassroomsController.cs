using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

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
                c.Id, c.Name, c.Building, c.Capacity, c.HasLab, c.HasProjector
            })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var classroom = await db.Classrooms.FindAsync(id);
        return classroom is null ? NotFound() : Ok(classroom);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Classroom classroom)
    {
        db.Classrooms.Add(classroom);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = classroom.Id }, classroom);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Classroom updated)
    {
        var classroom = await db.Classrooms.FindAsync(id);
        if (classroom is null) return NotFound();

        classroom.Name = updated.Name;
        classroom.Building = updated.Building;
        classroom.Capacity = updated.Capacity;
        classroom.HasLab = updated.HasLab;
        classroom.HasProjector = updated.HasProjector;

        await db.SaveChangesAsync();
        return Ok(classroom);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var classroom = await db.Classrooms.FindAsync(id);
        if (classroom is null) return NotFound();
        db.Classrooms.Remove(classroom);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
