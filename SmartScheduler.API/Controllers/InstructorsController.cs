using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Controllers;

/// <summary>DayOfWeek (0=Pazartesi…4=Cuma) ve saat bilgisini taşıyan müsaitlik dilimi.</summary>
public record AvailabilitySlot(int DayOfWeek, int Hour);

/// <summary>
/// Öğretim üyesi CRUD + ders ataması + haftalık müsaitlik yönetimi.
/// Müsaitlik verileri GeneticAlgorithmService tarafından soft constraint olarak kullanılır.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InstructorsController(AppDbContext db) : ControllerBase
{
    /// <summary>Tüm öğretim üyelerini ders sayısıyla birlikte listeler.</summary>
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
        if (await db.Instructors.AnyAsync(i => i.Email == instructor.Email))
            return Conflict(new { message = $"'{instructor.Email}' e-posta adresi zaten kayıtlı." });

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

        if (await db.Instructors.AnyAsync(i => i.Email == updated.Email && i.Id != id))
            return Conflict(new { message = $"'{updated.Email}' e-posta adresi zaten kayıtlı." });

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

    [HttpGet("{id}/courses")]
    public async Task<IActionResult> GetAssignedCourses(int id)
    {
        if (!await db.Instructors.AnyAsync(i => i.Id == id)) return NotFound();
        var ids = await db.Courses
            .Where(c => c.InstructorId == id)
            .Select(c => c.Id)
            .ToListAsync();
        return Ok(ids);
    }

    /// <summary>
    /// Bir hocanın ders listesini atomik olarak günceller.
    /// Önce hocadan tüm dersler alınır (InstructorId=0), ardından yeni liste atanır.
    /// Bu sayede başka hocada olan bir ders de yeniden atanabilir.
    /// </summary>
    [HttpPut("{id}/courses")]
    [Authorize]
    public async Task<IActionResult> UpdateCourses(int id, [FromBody] List<int> courseIds)
    {
        if (!await db.Instructors.AnyAsync(i => i.Id == id)) return NotFound();

        // Bu hocadan çıkarılan dersleri serbest bırak (atanmamış = 0)
        var previous = await db.Courses.Where(c => c.InstructorId == id).ToListAsync();
        foreach (var c in previous) c.InstructorId = 0;

        // Seçilen dersleri bu hocaya ata (başka hocadan alınanlar dahil)
        if (courseIds.Count > 0)
        {
            var toAssign = await db.Courses.Where(c => courseIds.Contains(c.Id)).ToListAsync();
            foreach (var c in toAssign) c.InstructorId = id;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/availability")]
    public async Task<IActionResult> GetAvailability(int id)
    {
        if (!await db.Instructors.AnyAsync(i => i.Id == id)) return NotFound();
        var slots = await db.InstructorAvailabilities
            .Where(a => a.InstructorId == id)
            .Select(a => new { a.DayOfWeek, a.Hour })
            .ToListAsync();
        return Ok(slots);
    }

    /// <summary>
    /// Hocanın haftalık müsaitlik tablosunu tamamen yeniler (replace-all stratejisi).
    /// Gelen slot listesi boşsa tüm müsaitlik silinir — algoritma o hoca için
    /// FullAvailability (her saat uygun) varsayılanına düşer.
    /// </summary>
    [HttpPut("{id}/availability")]
    [Authorize]
    public async Task<IActionResult> UpdateAvailability(int id, [FromBody] List<AvailabilitySlot> slots)
    {
        if (!await db.Instructors.AnyAsync(i => i.Id == id)) return NotFound();

        // Mevcut kayıtları sil, ardından yenilerini ekle
        var existing = await db.InstructorAvailabilities
            .Where(a => a.InstructorId == id).ToListAsync();
        db.InstructorAvailabilities.RemoveRange(existing);

        db.InstructorAvailabilities.AddRange(slots.Select(s => new InstructorAvailability
        {
            InstructorId = id,
            DayOfWeek = s.DayOfWeek,
            Hour = s.Hour,
        }));

        await db.SaveChangesAsync();
        return NoContent();
    }
}
