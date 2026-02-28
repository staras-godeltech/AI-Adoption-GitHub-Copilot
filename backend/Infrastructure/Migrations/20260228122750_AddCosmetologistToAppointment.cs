using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmetologyBooking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCosmetologistToAppointment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CosmetologistId",
                table: "Appointments",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Appointments",
                type: "TEXT",
                nullable: false,
                defaultValueSql: "datetime('now')");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CosmetologistId",
                table: "Appointments",
                column: "CosmetologistId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Users_CosmetologistId",
                table: "Appointments",
                column: "CosmetologistId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Users_CosmetologistId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_CosmetologistId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "CosmetologistId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Appointments");
        }
    }
}
