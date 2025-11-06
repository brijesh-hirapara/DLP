using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EmploymentSyncBaseAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "EmploymentHistory",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "EmploymentHistory",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "EmploymentHistory",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "EmploymentHistory",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "EmploymentHistory",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "EmploymentHistory",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EmploymentHistory");
        }
    }
}
