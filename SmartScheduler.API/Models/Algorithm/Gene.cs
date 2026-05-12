namespace SmartScheduler.API.Models.Algorithm;

/// <summary>
/// Genetik algoritma geni — bir dersin haftalık programdaki tek bir zaman dilimini temsil eder.
/// </summary>
public class Gene
{
    public int CourseId { get; set; }
    public int InstructorId { get; set; }
    public int ClassroomId { get; set; }
    public DayOfWeek Day { get; set; }
    public int TimeSlot { get; set; }   // 0=08:00, 1=09:00, ... 9=17:00

    public Gene() { }

    public Gene(int courseId, int instructorId, int classroomId, DayOfWeek day, int timeSlot)
    {
        CourseId = courseId;
        InstructorId = instructorId;
        ClassroomId = classroomId;
        Day = day;
        TimeSlot = timeSlot;
    }

    public Gene Clone() => new(CourseId, InstructorId, ClassroomId, Day, TimeSlot);
}
