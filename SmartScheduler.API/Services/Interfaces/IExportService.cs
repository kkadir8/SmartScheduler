namespace SmartScheduler.API.Services.Interfaces;

public interface IExportService
{
    Task<byte[]> GenerateSchedulePdfAsync(int scheduleId);
    Task<byte[]> GenerateScheduleExcelAsync(int scheduleId);
    Task<byte[]> GenerateCoursesExcelAsync();
    Task<byte[]> GenerateInstructorsExcelAsync();
    Task<byte[]> GenerateClassroomsExcelAsync();
}
