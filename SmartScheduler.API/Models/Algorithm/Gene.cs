namespace SmartScheduler.API.Models.Algorithm;

/// <summary>
/// Genetik algoritma geni — bir dersin haftalık programdaki tek bir zaman dilimini temsil eder.
/// Ders, başlangıç saatinden itibaren <see cref="DurationHours"/> saat boyunca kesintisiz işgal eder.
/// </summary>
public class Gene
{
    public int CourseId { get; set; }
    public int InstructorId { get; set; }
    public int ClassroomId { get; set; }
    public DayOfWeek Day { get; set; }
    public int TimeSlot { get; set; }       // 0=08:00, 1=09:00, ... (başlangıç dilimi)
    public int DurationHours { get; set; } = 2;  // dersin süresi (saat), 1..6

    public Gene() { }

    public Gene(int courseId, int instructorId, int classroomId, DayOfWeek day, int timeSlot, int durationHours)
    {
        CourseId = courseId;
        InstructorId = instructorId;
        ClassroomId = classroomId;
        Day = day;
        TimeSlot = timeSlot;
        DurationHours = durationHours;
    }

    public Gene Clone() => new(CourseId, InstructorId, ClassroomId, Day, TimeSlot, DurationHours);
}
