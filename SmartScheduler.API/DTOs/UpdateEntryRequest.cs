using System.ComponentModel.DataAnnotations;

namespace SmartScheduler.API.DTOs;

public class UpdateEntryRequest
{
    [Range(0, 4)]
    public int DayOfWeek { get; set; }

    [Range(8, 17)]
    public int StartHour { get; set; }
}
