namespace SmartScheduler.API.Models;

public class Course
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Credit { get; set; }
    /// <summary>Dersin haftalık tek oturum süresi (saat), 1–6. Kredi'den bağımsız.</summary>
    public int DurationHours { get; set; } = 2;
    public int StudentCount { get; set; }
    public int InstructorId { get; set; }
    public Instructor? Instructor { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ScheduleEntry> ScheduleEntries { get; set; } = [];
    public ICollection<Constraint> Constraints { get; set; } = [];
}
