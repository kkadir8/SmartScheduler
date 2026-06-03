using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class Sprint4_DataFix_CapacityAndAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"InstructorAvailabilities\"");

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 9,
                column: "StudentCount",
                value: 35);

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 11,
                column: "StudentCount",
                value: 35);

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 19,
                column: "StudentCount",
                value: 25);

            migrationBuilder.InsertData(
                table: "InstructorAvailabilities",
                columns: new[] { "Id", "DayOfWeek", "Hour", "InstructorId" },
                values: new object[,]
                {
                    { 1, 0, 8, 1 },
                    { 2, 0, 9, 1 },
                    { 3, 0, 10, 1 },
                    { 4, 0, 11, 1 },
                    { 5, 0, 12, 1 },
                    { 6, 0, 13, 1 },
                    { 7, 0, 14, 1 },
                    { 8, 0, 15, 1 },
                    { 9, 0, 16, 1 },
                    { 10, 0, 17, 1 },
                    { 11, 1, 8, 1 },
                    { 12, 1, 9, 1 },
                    { 13, 1, 10, 1 },
                    { 14, 1, 11, 1 },
                    { 15, 1, 12, 1 },
                    { 16, 1, 13, 1 },
                    { 17, 1, 14, 1 },
                    { 18, 1, 15, 1 },
                    { 19, 1, 16, 1 },
                    { 20, 1, 17, 1 },
                    { 21, 2, 8, 1 },
                    { 22, 2, 9, 1 },
                    { 23, 2, 10, 1 },
                    { 24, 2, 11, 1 },
                    { 25, 2, 12, 1 },
                    { 26, 2, 13, 1 },
                    { 27, 2, 14, 1 },
                    { 28, 2, 15, 1 },
                    { 29, 2, 16, 1 },
                    { 30, 2, 17, 1 },
                    { 31, 2, 8, 3 },
                    { 32, 2, 9, 3 },
                    { 33, 2, 10, 3 },
                    { 34, 2, 11, 3 },
                    { 35, 2, 12, 3 },
                    { 36, 2, 13, 3 },
                    { 37, 2, 14, 3 },
                    { 38, 2, 15, 3 },
                    { 39, 2, 16, 3 },
                    { 40, 2, 17, 3 },
                    { 41, 3, 8, 3 },
                    { 42, 3, 9, 3 },
                    { 43, 3, 10, 3 },
                    { 44, 3, 11, 3 },
                    { 45, 3, 12, 3 },
                    { 46, 3, 13, 3 },
                    { 47, 3, 14, 3 },
                    { 48, 3, 15, 3 },
                    { 49, 3, 16, 3 },
                    { 50, 3, 17, 3 },
                    { 51, 4, 8, 3 },
                    { 52, 4, 9, 3 },
                    { 53, 4, 10, 3 },
                    { 54, 4, 11, 3 },
                    { 55, 4, 12, 3 },
                    { 56, 4, 13, 3 },
                    { 57, 4, 14, 3 },
                    { 58, 4, 15, 3 },
                    { 59, 4, 16, 3 },
                    { 60, 4, 17, 3 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "InstructorAvailabilities",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 9,
                column: "StudentCount",
                value: 45);

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 11,
                column: "StudentCount",
                value: 40);

            migrationBuilder.UpdateData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 19,
                column: "StudentCount",
                value: 28);
        }
    }
}
