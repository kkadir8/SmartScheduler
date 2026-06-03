using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartScheduler.API.Migrations
{
    /// <summary>
    /// Hoca-ders atamalarını alan uzmanlığı ve yük dengesi gözetilerek yeniden düzenler.
    ///
    /// Önceki durum: Ayşe Kaya 3 ders (9 saat), birçok hoca 1 ders (1-2 saat).
    /// Yeni durum  : En yüklü hoca 6 saat; atamalar bölüm uzmanlığıyla eşleşiyor.
    ///
    /// Değişen atamalar:
    ///   CS304 Yapay Zeka      : Ahmet Yılmaz (1)  → Mustafa Öztürk (9)  — Prof. CS, YZ uzmanlığı
    ///   CS307 Veri Yapıları   : Mustafa Öztürk (9) → Mehmet Demir (3)   — Algoritma+DS doğal çift
    ///   CS309 Web Programlama : Elif Yıldız (8)   → Zeynep Arslan (6)   — NYP+Web tutarlı tema
    ///   CS310 Mobil Uygulama  : Burak Güneş (11)  → Elif Yıldız (8)     — Web→Mobil doğal geçiş
    ///   CS313 Bulut Bilişim   : Ceren Doğan (14)  → Merve Koç (12)      — Ceren'e DL yer açılır
    ///   CS314 Derin Öğrenme   : Ayşe Kaya (2)     → Ceren Doğan (14)    — Ayşe'nin yükü 9h→6h
    ///   CS315 Sistem Prog.    : Mehmet Demir (3)   → Tarık Şen (15)     — Sistemler Doç. uygun
    ///   CS317 Paralel Prog.   : Tarık Şen (15)    → Fatma Şahin (4)     — Ağlar+Paralel tutarlı
    ///   CS318 Bilgisayar Graf.: Merve Koç (12)    → Burak Güneş (11)    — Görsel CS, Burak uygun
    /// </summary>
    public partial class Sprint4_RebalanceInstructorAssignments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // CS304 Yapay Zeka: Ahmet (1) → Mustafa (9)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 4,
                column: "InstructorId", value: 9);

            // CS307 Veri Yapıları: Mustafa (9) → Mehmet (3)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 7,
                column: "InstructorId", value: 3);

            // CS309 Web Programlama: Elif (8) → Zeynep (6)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 9,
                column: "InstructorId", value: 6);

            // CS310 Mobil Uygulama: Burak (11) → Elif (8)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 10,
                column: "InstructorId", value: 8);

            // CS313 Bulut Bilişim: Ceren (14) → Merve (12)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 13,
                column: "InstructorId", value: 12);

            // CS314 Derin Öğrenme: Ayşe (2) → Ceren (14)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 14,
                column: "InstructorId", value: 14);

            // CS315 Sistem Programlama: Mehmet (3) → Tarık (15)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 15,
                column: "InstructorId", value: 15);

            // CS317 Paralel Programlama: Tarık (15) → Fatma (4)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 17,
                column: "InstructorId", value: 4);

            // CS318 Bilgisayar Grafikleri: Merve (12) → Burak (11)
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 18,
                column: "InstructorId", value: 11);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 4,
                column: "InstructorId", value: 1);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 7,
                column: "InstructorId", value: 9);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 9,
                column: "InstructorId", value: 8);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 10,
                column: "InstructorId", value: 11);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 13,
                column: "InstructorId", value: 14);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 14,
                column: "InstructorId", value: 2);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 15,
                column: "InstructorId", value: 3);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 17,
                column: "InstructorId", value: 15);

            migrationBuilder.UpdateData(
                table: "Courses", keyColumn: "Id", keyValue: 18,
                column: "InstructorId", value: 12);
        }
    }
}
