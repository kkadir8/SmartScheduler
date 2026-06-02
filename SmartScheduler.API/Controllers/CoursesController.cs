using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Courses
            .Include(c => c.Instructor)
            .Select(c => new
            {
                c.Id, c.Code, c.Name, c.Credit, c.StudentCount,
                InstructorName = c.Instructor != null ? c.Instructor.Name : null,
                c.InstructorId
            })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await db.Courses.Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == id);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Course course)
    {
        if (await db.Courses.AnyAsync(c => c.Code == course.Code))
            return Conflict(new { message = $"'{course.Code}' kodlu ders zaten mevcut." });

        db.Courses.Add(course);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] Course updated)
    {
        var course = await db.Courses.FindAsync(id);
        if (course is null) return NotFound();

        if (await db.Courses.AnyAsync(c => c.Code == updated.Code && c.Id != id))
            return Conflict(new { message = $"'{updated.Code}' kodlu ders zaten mevcut." });

        course.Code = updated.Code;
        course.Name = updated.Name;
        course.Credit = updated.Credit;
        course.StudentCount = updated.StudentCount;
        course.InstructorId = updated.InstructorId;

        await db.SaveChangesAsync();
        return Ok(course);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await db.Courses.FindAsync(id);
        if (course is null) return NotFound();
        db.Courses.Remove(course);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
