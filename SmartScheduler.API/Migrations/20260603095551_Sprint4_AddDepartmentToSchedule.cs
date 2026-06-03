using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class Sprint4_AddDepartmentToSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Schedules",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Department",
                table: "Schedules");
        }
    }
}
