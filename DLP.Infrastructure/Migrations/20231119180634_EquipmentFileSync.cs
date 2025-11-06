using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EquipmentFileSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Translations");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Municipalities");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Languages");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Codebooks");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Cantons");

            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "QualificationFiles",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "QualificationFiles",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "QualificationFiles",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "Equipments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "Equipments",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "Equipments",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "EquipmentFiles",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "EquipmentFiles",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "EquipmentFiles",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "EquipmentActivityFiles",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "EquipmentActivityFiles",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "EquipmentActivityFiles",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "EquipmentActivities",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "EquipmentActivities",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "EquipmentActivities",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "QualificationFiles");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "QualificationFiles");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "QualificationFiles");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "EquipmentFiles");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "EquipmentFiles");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EquipmentFiles");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "EquipmentActivityFiles");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "EquipmentActivityFiles");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EquipmentActivityFiles");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EquipmentActivities");

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Translations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "RefrigerantTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Qualifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Organizations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Municipalities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Languages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "EmploymentHistory",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Codebooks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Cantons",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
