namespace SmartScheduler.API.Models;

public class Classroom
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Building { get; set; }
    public int Capacity { get; set; }
    public bool HasLab { get; set; }
    public bool HasProjector { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ScheduleEntry> ScheduleEntries { get; set; } = [];
}
