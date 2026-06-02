using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SmartScheduler.API.Data;

namespace SmartScheduler.API.Services;

public class ExportService
{
    private readonly AppDbContext _db;

    // Gün numaralarını Türkçe karşılıklarına çevirir (0=Pazartesi … 4=Cuma)
    private static readonly string[] GunleriTurkce = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    public ExportService(AppDbContext db)
    {
        _db = db;
    }

    // ─────────────────────────────────────────────
    //  PDF — Haftalık Ders Programı (TAKVİM GRİD)
    // ─────────────────────────────────────────────

    public async Task<byte[]> GenerateSchedulePdfAsync(int scheduleId)
    {
        var schedule = await _db.Schedules
            .Include(s => s.Entries)
                .ThenInclude(e => e.Course)
                    .ThenInclude(c => c.Instructor)
            .Include(s => s.Entries)
                .ThenInclude(e => e.Classroom)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new KeyNotFoundException($"Schedule #{scheduleId} bulunamadı.");

        var entries = schedule.Entries
            .OrderBy(e => e.DayOfWeek)
            .ThenBy(e => e.StartHour)
            .ToList();

        QuestPDF.Settings.License = LicenseType.Community;

        var pdfBytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                // ── BAŞLIK ──
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("SmartScheduler")
                                .FontSize(18).Bold().FontColor("#1a56db");
                            c.Item().Text("DevArchitechs — Haftalık Ders Programı")
                                .FontSize(8).FontColor("#6b7280");
                        });
                        row.ConstantItem(220).AlignRight().Column(c =>
                        {
                            c.Item().Text(schedule.Name).Bold().FontSize(12);
                            c.Item().Text($"Dönem: {schedule.Semester}").FontSize(8).FontColor("#374151");
                            c.Item().Text($"Oluşturma: {schedule.GeneratedAt:dd.MM.yyyy HH:mm}").FontSize(8).FontColor("#6b7280");
                            if (schedule.FitnessScore.HasValue)
                                c.Item().Text($"Fitness: {schedule.FitnessScore:F2}  |  {entries.Count} ders")
                                    .FontSize(8).FontColor("#6b7280");
                        });
                    });
                    col.Item().PaddingTop(5).LineHorizontal(2f).LineColor("#1a56db");
                });

                // ── TAKVİM GRİD İÇERİĞİ ──
                page.Content().PaddingTop(10).Column(col =>
                {
                    if (!entries.Any())
                    {
                        col.Item().Text("Bu program için henüz ders girişi bulunmamaktadır.")
                            .FontColor("#9ca3af").Italic();
                        return;
                    }

                    // (gün, saat) → entry lookup tablosu
                    var entryMap = entries
                        .GroupBy(e => (e.DayOfWeek, e.StartHour))
                        .ToDictionary(g => g.Key, g => g.First());

                    // Kullanılan saat aralığını bul
                    var minHour = entries.Min(e => e.StartHour);
                    var maxHour = entries.Max(e => e.StartHour + e.DurationHours - 1);
                    var timeSlots = Enumerable.Range(minHour, maxHour - minHour + 1).ToList();

                    // Her gün için renk çifti: açık arka plan + koyu kenarlık/metin
                    var gunRenkleri = new[] { "#dbeafe", "#dcfce7", "#fef9c3", "#ffe4e6", "#f3e8ff" };
                    var gunKoyu    = new[] { "#1d4ed8", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed" };

                    col.Item().Table(table =>
                    {
                        // 6 sütun: Saat | Pazartesi | Salı | Çarşamba | Perşembe | Cuma
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(48);  // Saat
                            columns.RelativeColumn();    // Pazartesi
                            columns.RelativeColumn();    // Salı
                            columns.RelativeColumn();    // Çarşamba
                            columns.RelativeColumn();    // Perşembe
                            columns.RelativeColumn();    // Cuma
                        });

                        // ── BAŞLIK SATIRI ──
                        table.Header(header =>
                        {
                            header.Cell()
                                .Background("#1e293b").Padding(6).AlignCenter()
                                .Text("Saat").Bold().FontColor(Colors.White).FontSize(8);

                            for (int d = 0; d < 5; d++)
                            {
                                int dayCount = entries.Count(e => e.DayOfWeek == d);
                                header.Cell()
                                    .Background(gunKoyu[d]).Padding(6).AlignCenter()
                                    .Column(c =>
                                    {
                                        c.Item().Text(GunleriTurkce[d])
                                            .Bold().FontColor(Colors.White).FontSize(9);
                                        if (dayCount > 0)
                                            c.Item().Text($"{dayCount} ders")
                                                .FontColor(Colors.White).FontSize(7);
                                    });
                            }
                        });

                        // ── SAAT DİLİMİ SATIRLARI ──
                        foreach (var hour in timeSlots)
                        {
                            var satirBg = hour % 2 == 0 ? "#f8fafc" : "#ffffff";

                            // Saat hücresi (sol kolon)
                            table.Cell()
                                .Background("#e2e8f0")
                                .Border(0.5f).BorderColor("#cbd5e1")
                                .Padding(5).AlignCenter().AlignMiddle()
                                .Text($"{hour:D2}:00")
                                .Bold().FontSize(8).FontColor("#1e293b");

                            // 5 gün hücresi
                            for (int day = 0; day < 5; day++)
                            {
                                var key = (day, hour);
                                if (entryMap.TryGetValue(key, out var entry))
                                {
                                    var dersAdi   = entry.Course?.Name ?? "—";
                                    var dersKodu  = entry.Course?.Code ?? "";
                                    var hocaAdi   = entry.Course?.Instructor?.Name ?? "—";
                                    var hocaUnvan = entry.Course?.Instructor?.Title ?? "";
                                    var derslik   = entry.Classroom?.Name ?? "—";
                                    var bina      = entry.Classroom?.Building ?? "";
                                    var sure      = $"{entry.DurationHours} saat";
                                    var derslikBilgi = !string.IsNullOrEmpty(bina)
                                        ? $"{derslik} · {bina}" : derslik;

                                    table.Cell()
                                        .Background(gunRenkleri[day])
                                        .Border(0.5f).BorderColor(gunKoyu[day])
                                        .Padding(5)
                                        .Column(c =>
                                        {
                                            // Ders adı (kalın, büyük)
                                            c.Item().Text(dersAdi)
                                                .Bold().FontSize(8).FontColor("#0f172a");
                                            // Ders kodu (renkli küçük)
                                            if (!string.IsNullOrEmpty(dersKodu))
                                                c.Item().Text(dersKodu)
                                                    .FontSize(7).FontColor(gunKoyu[day]);
                                            // Hoca bilgisi
                                            c.Item().PaddingTop(2)
                                                .Text($"{hocaUnvan} {hocaAdi}".Trim())
                                                .FontSize(7).FontColor("#374151");
                                            // Derslik + bina
                                            c.Item().Text(derslikBilgi)
                                                .FontSize(7).FontColor("#6b7280");
                                            // Süre (sağa hizalı küçük)
                                            c.Item().AlignRight().Text(sure)
                                                .FontSize(6).FontColor("#94a3b8");
                                        });
                                }
                                else
                                {
                                    // Boş hücre
                                    table.Cell()
                                        .Background(satirBg)
                                        .Border(0.5f).BorderColor("#e2e8f0")
                                        .MinHeight(42)
                                        .Text("").FontSize(7);
                                }
                            }
                        }
                    });

                    // Alt özet
                    col.Item().PaddingTop(8).Row(row =>
                    {
                        row.RelativeItem()
                            .Text($"Toplam: {entries.Count} ders  •  {timeSlots.Count} saat dilimi ({timeSlots.First():D2}:00 – {timeSlots.Last():D2}:00)")
                            .FontSize(7).FontColor("#6b7280").Italic();

                        for (int d = 0; d < 5; d++)
                        {
                            var count = entries.Count(e => e.DayOfWeek == d);
                            if (count > 0)
                                row.AutoItem().PaddingLeft(10)
                                    .Text($"{GunleriTurkce[d]}: {count}")
                                    .FontSize(7).FontColor(gunKoyu[d]);
                        }
                    });
                });

                // ── ALT BİLGİ ──
                page.Footer().Row(row =>
                {
                    row.RelativeItem()
                        .Text($"SmartScheduler — DevArchitechs — {DateTime.Now:dd.MM.yyyy}")
                        .FontSize(7).FontColor("#9ca3af");
                    row.ConstantItem(80).AlignRight()
                        .Text(x =>
                        {
                            x.Span("Sayfa ").FontSize(7).FontColor("#9ca3af");
                            x.CurrentPageNumber().FontSize(7).FontColor("#9ca3af");
                            x.Span(" / ").FontSize(7).FontColor("#9ca3af");
                            x.TotalPages().FontSize(7).FontColor("#9ca3af");
                        });
                });
            });
        }).GeneratePdf();

        return pdfBytes;
    }

    // ─────────────────────────────────────────────
    //  EXCEL — Ders Programı (Schedule)
    // ─────────────────────────────────────────────

    public async Task<byte[]> GenerateScheduleExcelAsync(int scheduleId)
    {
        var schedule = await _db.Schedules
            .Include(s => s.Entries)
                .ThenInclude(e => e.Course)
                    .ThenInclude(c => c.Instructor)
            .Include(s => s.Entries)
                .ThenInclude(e => e.Classroom)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new KeyNotFoundException($"Schedule #{scheduleId} bulunamadı.");

        using var workbook = new XLWorkbook();

        // ── Sheet 1: Program Bilgisi ──
        var infoSheet = workbook.Worksheets.Add("Program Bilgisi");
        infoSheet.Cell("A1").Value = "SmartScheduler — Ders Programı";
        infoSheet.Cell("A1").Style.Font.Bold = true;
        infoSheet.Cell("A1").Style.Font.FontSize = 16;
        infoSheet.Cell("A1").Style.Font.FontColor = XLColor.FromHtml("#1a56db");

        infoSheet.Cell("A3").Value = "Program Adı";
        infoSheet.Cell("B3").Value = schedule.Name;
        infoSheet.Cell("A4").Value = "Dönem";
        infoSheet.Cell("B4").Value = schedule.Semester;
        infoSheet.Cell("A5").Value = "Durum";
        infoSheet.Cell("B5").Value = schedule.IsActive ? "Aktif" : "Pasif";
        infoSheet.Cell("A6").Value = "Fitness Skoru";
        infoSheet.Cell("B6").Value = schedule.FitnessScore?.ToString("F2") ?? "—";
        infoSheet.Cell("A7").Value = "Oluşturma Tarihi";
        infoSheet.Cell("B7").Value = schedule.GeneratedAt.ToString("dd.MM.yyyy HH:mm");
        infoSheet.Cell("A8").Value = "Toplam Ders Girişi";
        infoSheet.Cell("B8").Value = schedule.Entries.Count;

        foreach (var row in new[] { 3, 4, 5, 6, 7, 8 })
        {
            infoSheet.Cell($"A{row}").Style.Font.Bold = true;
            infoSheet.Cell($"A{row}").Style.Font.FontColor = XLColor.FromHtml("#374151");
        }

        infoSheet.Column("A").Width = 22;
        infoSheet.Column("B").Width = 30;

        // ── Sheet 2: Ders Girişleri ──
        var entrySheet = workbook.Worksheets.Add("Ders Girişleri");
        var entryHeaders = new[] { "ID", "Gün", "Başlangıç Saati", "Bitiş Saati", "Süre (Saat)", "Ders Kodu", "Ders Adı", "Öğretim Üyesi", "Unvan", "Derslik", "Bina", "Kapasite" };
        for (int i = 0; i < entryHeaders.Length; i++)
        {
            var cell = entrySheet.Cell(1, i + 1);
            cell.Value = entryHeaders[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1a56db");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        var entries = schedule.Entries.OrderBy(e => e.DayOfWeek).ThenBy(e => e.StartHour).ToList();
        for (int i = 0; i < entries.Count; i++)
        {
            var e = entries[i];
            var r = i + 2;
            var gun = e.DayOfWeek >= 0 && e.DayOfWeek < GunleriTurkce.Length ? GunleriTurkce[e.DayOfWeek] : $"Gün {e.DayOfWeek}";
            var bgColor = i % 2 == 0 ? XLColor.White : XLColor.FromHtml("#f3f4f6");

            entrySheet.Cell(r, 1).Value = e.Id;
            entrySheet.Cell(r, 2).Value = gun;
            entrySheet.Cell(r, 3).Value = $"{e.StartHour:D2}:00";
            entrySheet.Cell(r, 4).Value = $"{e.StartHour + e.DurationHours:D2}:00";
            entrySheet.Cell(r, 5).Value = e.DurationHours;
            entrySheet.Cell(r, 6).Value = e.Course?.Code ?? "—";
            entrySheet.Cell(r, 7).Value = e.Course?.Name ?? "—";
            entrySheet.Cell(r, 8).Value = e.Course?.Instructor?.Name ?? "—";
            entrySheet.Cell(r, 9).Value = e.Course?.Instructor?.Title ?? "—";
            entrySheet.Cell(r, 10).Value = e.Classroom?.Name ?? "—";
            entrySheet.Cell(r, 11).Value = e.Classroom?.Building ?? "—";
            entrySheet.Cell(r, 12).Value = e.Classroom?.Capacity ?? 0;

            var rowRange = entrySheet.Range(r, 1, r, entryHeaders.Length);
            rowRange.Style.Fill.BackgroundColor = bgColor;
        }

        foreach (var col in Enumerable.Range(1, entryHeaders.Length))
            entrySheet.Column(col).AdjustToContents();

        entrySheet.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    // ─────────────────────────────────────────────
    //  EXCEL — Tüm Dersler
    // ─────────────────────────────────────────────

    public async Task<byte[]> GenerateCoursesExcelAsync()
    {
        var courses = await _db.Courses
            .Include(c => c.Instructor)
            .OrderBy(c => c.Code)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Dersler");

        var headers = new[] { "ID", "Ders Kodu", "Ders Adı", "Kredi", "Öğrenci Sayısı", "Öğretim Üyesi", "Unvan", "Bölüm", "E-posta", "Oluşturma Tarihi" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = sheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1a56db");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
        }

        for (int i = 0; i < courses.Count; i++)
        {
            var c = courses[i];
            var r = i + 2;
            var bgColor = i % 2 == 0 ? XLColor.White : XLColor.FromHtml("#eff6ff");

            sheet.Cell(r, 1).Value = c.Id;
            sheet.Cell(r, 2).Value = c.Code;
            sheet.Cell(r, 3).Value = c.Name;
            sheet.Cell(r, 4).Value = c.Credit;
            sheet.Cell(r, 5).Value = c.StudentCount;
            sheet.Cell(r, 6).Value = c.Instructor?.Name ?? "—";
            sheet.Cell(r, 7).Value = c.Instructor?.Title ?? "—";
            sheet.Cell(r, 8).Value = c.Instructor?.Department ?? "—";
            sheet.Cell(r, 9).Value = c.Instructor?.Email ?? "—";
            sheet.Cell(r, 10).Value = c.CreatedAt.ToString("dd.MM.yyyy");

            sheet.Range(r, 1, r, headers.Length).Style.Fill.BackgroundColor = bgColor;
        }

        var summaryRow = courses.Count + 2;
        sheet.Cell(summaryRow, 1).Value = $"Toplam: {courses.Count} ders";
        sheet.Cell(summaryRow, 1).Style.Font.Bold = true;
        sheet.Cell(summaryRow, 1).Style.Font.FontColor = XLColor.FromHtml("#6b7280");

        foreach (var col in Enumerable.Range(1, headers.Length))
            sheet.Column(col).AdjustToContents();

        sheet.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    // ─────────────────────────────────────────────
    //  EXCEL — Tüm Hocalar
    // ─────────────────────────────────────────────

    public async Task<byte[]> GenerateInstructorsExcelAsync()
    {
        var instructors = await _db.Instructors
            .Include(i => i.Courses)
            .OrderBy(i => i.Name)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Öğretim Üyeleri");

        var headers = new[] { "ID", "Ad Soyad", "Unvan", "Bölüm", "E-posta", "Ders Sayısı", "Dersler", "Oluşturma Tarihi" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = sheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#059669");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
        }

        for (int i = 0; i < instructors.Count; i++)
        {
            var ins = instructors[i];
            var r = i + 2;
            var bgColor = i % 2 == 0 ? XLColor.White : XLColor.FromHtml("#ecfdf5");
            var dersler = ins.Courses.Any()
                ? string.Join(", ", ins.Courses.Select(c => c.Code))
                : "—";

            sheet.Cell(r, 1).Value = ins.Id;
            sheet.Cell(r, 2).Value = ins.Name;
            sheet.Cell(r, 3).Value = ins.Title;
            sheet.Cell(r, 4).Value = ins.Department;
            sheet.Cell(r, 5).Value = ins.Email;
            sheet.Cell(r, 6).Value = ins.Courses.Count;
            sheet.Cell(r, 7).Value = dersler;
            sheet.Cell(r, 8).Value = ins.CreatedAt.ToString("dd.MM.yyyy");

            sheet.Range(r, 1, r, headers.Length).Style.Fill.BackgroundColor = bgColor;
        }

        var summaryRow = instructors.Count + 2;
        sheet.Cell(summaryRow, 1).Value = $"Toplam: {instructors.Count} öğretim üyesi";
        sheet.Cell(summaryRow, 1).Style.Font.Bold = true;
        sheet.Cell(summaryRow, 1).Style.Font.FontColor = XLColor.FromHtml("#6b7280");

        foreach (var col in Enumerable.Range(1, headers.Length))
            sheet.Column(col).AdjustToContents();

        sheet.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}
