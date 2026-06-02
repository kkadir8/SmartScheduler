using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConstraintsController(AppDbContext db) : ControllerBase
{
    // GET /api/constraints
    // Tüm kısıtları ders ve derslik bilgileriyle birlikte listeler
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Constraints
            .Include(c => c.Course)
            .Include(c => c.Classroom)
            .Select(c => new
            {
                c.Id,
                c.CourseId,
                CourseName = c.Course.Name,
                CourseCode = c.Course.Code,
                c.ClassroomId,
                ClassroomName = c.Classroom.Name,
                ClassroomBuilding = c.Classroom.Building,
                c.Notes,
                c.CreatedAt
            })
            .OrderBy(c => c.CourseCode)
            .ToListAsync());

    // GET /api/constraints/{id}
    // Tek bir kısıt kaydını getirir
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var constraint = await db.Constraints
            .Include(c => c.Course)
            .Include(c => c.Classroom)
            .FirstOrDefaultAsync(c => c.Id == id);

        return constraint is null ? NotFound() : Ok(constraint);
    }

    // GET /api/constraints/course/{courseId}
    // Belirli bir dersin tüm izin verilen dersliklerini getirir
    // Frontend kısıt sayfasında ders seçilince bu endpoint kullanılır
    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        var exists = await db.Courses.AnyAsync(c => c.Id == courseId);
        if (!exists) return NotFound(new { message = $"CourseId={courseId} bulunamadı." });

        var constraints = await db.Constraints
            .Where(c => c.CourseId == courseId)
            .Include(c => c.Classroom)
            .Select(c => new
            {
                c.Id,
                c.ClassroomId,
                ClassroomName = c.Classroom.Name,
                ClassroomBuilding = c.Classroom.Building,
                ClassroomCapacity = c.Classroom.Capacity,
                ClassroomHasLab = c.Classroom.HasLab,
                c.Notes
            })
            .ToListAsync();

        return Ok(constraints);
    }

    // POST /api/constraints
    // Yeni bir ders-derslik kısıtı ekler (JWT zorunlu)
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Constraint constraint)
    {
        // Referans bütünlüğü kontrolü (önce girdiler geçerli mi?)
        var courseExists    = await db.Courses.AnyAsync(c => c.Id == constraint.CourseId);
        var classroomExists = await db.Classrooms.AnyAsync(c => c.Id == constraint.ClassroomId);

        if (!courseExists)    return BadRequest(new { message = $"CourseId={constraint.CourseId} bulunamadı." });
        if (!classroomExists) return BadRequest(new { message = $"ClassroomId={constraint.ClassroomId} bulunamadı." });

        // Aynı çift zaten varsa hata döndür
        var duplicate = await db.Constraints
            .AnyAsync(c => c.CourseId == constraint.CourseId
                        && c.ClassroomId == constraint.ClassroomId);
        if (duplicate)
            return Conflict(new { message = "Bu ders-derslik kısıtı zaten mevcut." });

        constraint.CreatedAt = DateTime.UtcNow;
        db.Constraints.Add(constraint);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = constraint.Id }, constraint);
    }

    // DELETE /api/constraints/{id}
    // Bir kısıt kaydını siler (JWT zorunlu)
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var constraint = await db.Constraints.FindAsync(id);
        if (constraint is null) return NotFound();

        db.Constraints.Remove(constraint);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
