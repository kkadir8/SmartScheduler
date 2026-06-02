using Microsoft.AspNetCore.Mvc;
using SmartScheduler.API.Services.Interfaces;

namespace SmartScheduler.API.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    /// <summary>
    /// Belirtilen ders programını PDF olarak indirir.
    /// PDF içeriği: Gün, Başlangıç Saati, Ders Adı, Öğretim Üyesi, Derslik, Kapasite, Süre
    /// </summary>
    [HttpGet("schedules/{id}/pdf")]
    public async Task<IActionResult> ExportSchedulePdf(int id)
    {
        try
        {
            var pdfBytes = await _exportService.GenerateSchedulePdfAsync(id);
            var dosyaAdi = $"ders-programi-{id}-{DateTime.Now:yyyyMMdd}.pdf";
            return File(pdfBytes, "application/pdf", dosyaAdi);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "PDF oluşturulurken hata oluştu.", detail = ex.Message });
        }
    }

    /// <summary>
    /// Belirtilen ders programını Excel (.xlsx) olarak indirir.
    /// Sheet 1: Program Bilgisi, Sheet 2: Ders Girişleri (gün, saat, ders, hoca, derslik)
    /// </summary>
    [HttpGet("schedules/{id}/excel")]
    public async Task<IActionResult> ExportScheduleExcel(int id)
    {
        try
        {
            var excelBytes = await _exportService.GenerateScheduleExcelAsync(id);
            var dosyaAdi = $"ders-programi-{id}-{DateTime.Now:yyyyMMdd}.xlsx";
            return File(
                excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dosyaAdi
            );
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Excel oluşturulurken hata oluştu.", detail = ex.Message });
        }
    }

    /// <summary>
    /// Sistemdeki tüm dersleri Excel (.xlsx) olarak indirir.
    /// İçerik: Ders Kodu, Ders Adı, Kredi, Öğrenci Sayısı, Öğretim Üyesi, Bölüm, E-posta
    /// </summary>
    [HttpGet("courses/excel")]
    public async Task<IActionResult> ExportCoursesExcel()
    {
        try
        {
            var excelBytes = await _exportService.GenerateCoursesExcelAsync();
            var dosyaAdi = $"dersler-{DateTime.Now:yyyyMMdd}.xlsx";
            return File(
                excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dosyaAdi
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Excel oluşturulurken hata oluştu.", detail = ex.Message });
        }
    }

    /// <summary>
    /// Sistemdeki tüm öğretim üyelerini Excel (.xlsx) olarak indirir.
    /// İçerik: Ad Soyad, Unvan, Bölüm, E-posta, Ders Sayısı, Ders Kodları
    /// </summary>
    [HttpGet("instructors/excel")]
    public async Task<IActionResult> ExportInstructorsExcel()
    {
        try
        {
            var excelBytes = await _exportService.GenerateInstructorsExcelAsync();
            var dosyaAdi = $"ogretim-uyeleri-{DateTime.Now:yyyyMMdd}.xlsx";
            return File(
                excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dosyaAdi
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Excel oluşturulurken hata oluştu.", detail = ex.Message });
        }
    }

    /// <summary>
    /// Sistemdeki tüm derslikleri (sınıfları) Excel (.xlsx) olarak indirir.
    /// İçerik: Sınıf Adı, Kapasite, Bina, Laboratuvar, Projektör vb.
    /// </summary>
    [HttpGet("classrooms/excel")]
    public async Task<IActionResult> ExportClassroomsExcel()
    {
        try
        {
            var excelBytes = await _exportService.GenerateClassroomsExcelAsync();
            var dosyaAdi = $"derslikler-{DateTime.Now:yyyyMMdd}.xlsx";
            return File(
                excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dosyaAdi
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Excel oluşturulurken hata oluştu.", detail = ex.Message });
        }
    }
}
