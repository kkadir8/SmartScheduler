using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class Sprint3_Constraints_SeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Constraints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    ClassroomId = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Constraints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Constraints_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Constraints_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Classrooms",
                columns: new[] { "Id", "Building", "Capacity", "CreatedAt", "HasLab", "HasProjector", "Name" },
                values: new object[,]
                {
                    { 6, "B Blok", 50, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "B-301" },
                    { 7, "C Blok", 45, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "C-102" },
                    { 8, "Amfi Binası", 150, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "AMFİ-1" },
                    { 9, "Laboratuvar Binası", 35, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "LAB-3" },
                    { 10, "D Blok", 55, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "D-102" },
                    { 11, "A Blok", 70, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "A-201" },
                    { 12, "Laboratuvar Binası", 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "LAB-4" },
                    { 13, "B Blok", 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "B-102" },
                    { 14, "C Blok", 60, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "C-201" },
                    { 15, "Amfi Binası", 100, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), false, true, "AMFİ-2" }
                });

            migrationBuilder.InsertData(
                table: "Courses",
                columns: new[] { "Id", "Code", "CreatedAt", "Credit", "InstructorId", "Name", "StudentCount" },
                values: new object[,]
                {
                    { 11, "CS311", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, 2, "Makine Öğrenmesi", 40 },
                    { 14, "CS314", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, 2, "Derin Öğrenme", 25 },
                    { 15, "CS315", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 3, "Sistem Programlama", 50 }
                });

            migrationBuilder.InsertData(
                table: "Instructors",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "Name", "Title" },
                values: new object[,]
                {
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Elektrik-Elektronik Müh.", "ali.celik@uni.edu.tr", "Ali Çelik", "Prof. Dr." },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "zeynep.arslan@uni.edu.tr", "Zeynep Arslan", "Dr. Öğr. Üyesi" },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Matematik", "hasan.kilic@uni.edu.tr", "Hasan Kılıç", "Doç. Dr." },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "elif.yildiz@uni.edu.tr", "Elif Yıldız", "Dr. Öğr. Üyesi" },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "mustafa.ozturk@uni.edu.tr", "Mustafa Öztürk", "Prof. Dr." },
                    { 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Endüstri Mühendisliği", "selin.aydin@uni.edu.tr", "Selin Aydın", "Dr. Öğr. Üyesi" },
                    { 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "burak.gunes@uni.edu.tr", "Burak Güneş", "Doç. Dr." },
                    { 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "merve.koc@uni.edu.tr", "Merve Koç", "Dr. Öğr. Üyesi" },
                    { 13, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yazılım Mühendisliği", "emre.yilmaz@uni.edu.tr", "Emre Yılmaz", "Prof. Dr." },
                    { 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "ceren.dogan@uni.edu.tr", "Ceren Doğan", "Dr. Öğr. Üyesi" },
                    { 15, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bilgisayar Mühendisliği", "tarik.sen@uni.edu.tr", "Tarık Şen", "Doç. Dr." }
                });

            migrationBuilder.InsertData(
                table: "Constraints",
                columns: new[] { "Id", "ClassroomId", "CourseId", "CreatedAt", "Notes" },
                values: new object[,]
                {
                    { 7, 9, 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "GPU destekli lab gerektirir" },
                    { 8, 12, 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "GPU destekli lab gerektirir" },
                    { 11, 5, 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "GPU lab gerektirir" },
                    { 12, 12, 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "GPU lab gerektirir" }
                });

            migrationBuilder.InsertData(
                table: "Courses",
                columns: new[] { "Id", "Code", "CreatedAt", "Credit", "InstructorId", "Name", "StudentCount" },
                values: new object[,]
                {
                    { 6, "CS306", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 5, "İşletim Sistemleri", 65 },
                    { 7, "CS307", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, 9, "Veri Yapıları", 70 },
                    { 8, "CS308", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 6, "Nesne Yönelimli Programlama", 55 },
                    { 9, "CS309", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 8, "Web Programlama", 45 },
                    { 10, "CS310", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 11, "Mobil Uygulama Geliştirme", 35 },
                    { 12, "CS312", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 13, "Siber Güvenlik", 30 },
                    { 13, "CS313", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 14, "Bulut Bilişim", 38 },
                    { 16, "CS316", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 7, "Derleyici Tasarımı", 35 },
                    { 17, "CS317", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 15, "Paralel Programlama", 30 },
                    { 18, "CS318", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 12, "Bilgisayar Grafikleri", 40 },
                    { 19, "CS319", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4, 5, "Gömülü Sistemler", 28 },
                    { 20, "CS320", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 10, "Proje Yönetimi", 80 }
                });

            migrationBuilder.InsertData(
                table: "Constraints",
                columns: new[] { "Id", "ClassroomId", "CourseId", "CreatedAt", "Notes" },
                values: new object[,]
                {
                    { 1, 3, 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Lab bilgisayarı gerektirir" },
                    { 2, 9, 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Lab bilgisayarı gerektirir" },
                    { 3, 12, 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Lab bilgisayarı gerektirir" },
                    { 4, 3, 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mobil geliştirme ortamı gerektirir" },
                    { 5, 5, 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mobil geliştirme ortamı gerektirir" },
                    { 6, 9, 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mobil geliştirme ortamı gerektirir" },
                    { 9, 3, 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "İzole ağ ortamı gerektirir" },
                    { 10, 5, 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "İzole ağ ortamı gerektirir" },
                    { 13, 5, 19, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Donanım lab gerektirir" },
                    { 14, 12, 19, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Donanım lab gerektirir" },
                    { 15, 4, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yüksek kapasiteli sınıf gerektirir" },
                    { 16, 11, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yüksek kapasiteli sınıf gerektirir" },
                    { 17, 8, 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yüksek kapasiteli sınıf gerektirir" },
                    { 18, 4, 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yüksek kapasiteli sınıf gerektirir" },
                    { 19, 8, 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Yüksek kapasiteli sınıf gerektirir" },
                    { 20, 8, 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Amfi gerektirir" },
                    { 21, 15, 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Amfi gerektirir" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Constraints_ClassroomId",
                table: "Constraints",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_Constraints_CourseId_ClassroomId",
                table: "Constraints",
                columns: new[] { "CourseId", "ClassroomId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Constraints");

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Classrooms",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Instructors",
                keyColumn: "Id",
                keyValue: 15);
        }
    }
}
