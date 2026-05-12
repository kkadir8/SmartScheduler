namespace SmartScheduler.API.Models;

public class Schedule
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Semester { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public double? FitnessScore { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ScheduleEntry> Entries { get; set; } = [];
}
