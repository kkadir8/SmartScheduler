namespace SmartScheduler.API.Models;

public class ScheduleEntry
{
    public int Id { get; set; }

    public int ScheduleId { get; set; }
    public Schedule Schedule { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public int ClassroomId { get; set; }
    public Classroom Classroom { get; set; } = null!;

    /// <summary>0=Pazartesi … 4=Cuma</summary>
    public int DayOfWeek { get; set; }

    /// <summary>8 … 18</summary>
    public int StartHour { get; set; }

    public int DurationHours { get; set; } = 2;
}
