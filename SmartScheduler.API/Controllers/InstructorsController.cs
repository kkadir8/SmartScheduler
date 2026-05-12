using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

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
                i.Id, i.Name, i.Title, i.Department, i.Email,
                CourseCount = i.Courses.Count
            })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var instructor = await db.Instructors.Include(i => i.Courses)
            .FirstOrDefaultAsync(i => i.Id == id);
        return instructor is null ? NotFound() : Ok(instructor);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Instructor instructor)
    {
        db.Instructors.Add(instructor);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = instructor.Id }, instructor);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Instructor updated)
    {
        var instructor = await db.Instructors.FindAsync(id);
        if (instructor is null) return NotFound();

        instructor.Name = updated.Name;
        instructor.Title = updated.Title;
        instructor.Department = updated.Department;
        instructor.Email = updated.Email;

        await db.SaveChangesAsync();
        return Ok(instructor);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var instructor = await db.Instructors.FindAsync(id);
        if (instructor is null) return NotFound();
        db.Instructors.Remove(instructor);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
