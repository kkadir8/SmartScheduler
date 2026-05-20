using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace SmartScheduler.API.Models;

public class InstructorAvailability
{
    public int Id { get; set; }

    public int InstructorId { get; set; }
    [JsonIgnore]
    [ValidateNever]
    public Instructor Instructor { get; set; } = null!;

    /// <summary>0 = Pazartesi … 4 = Cuma</summary>
    public int DayOfWeek { get; set; }

    /// <summary>8 … 18</summary>
    public int Hour { get; set; }
}
