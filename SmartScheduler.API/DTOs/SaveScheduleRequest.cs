namespace SmartScheduler.API.DTOs;

public class SaveScheduleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
    public double? FitnessPercent { get; set; }
    public List<SaveScheduleEntry> Entries { get; set; } = [];
}

public class SaveScheduleEntry
{
    public int CourseId { get; set; }
    public int ClassroomId { get; set; }
    public int DayOfWeek { get; set; }   // 0=Pazartesi..4=Cuma
    public int StartHour { get; set; }   // 8..18
    public int DurationHours { get; set; } = 2;
}
