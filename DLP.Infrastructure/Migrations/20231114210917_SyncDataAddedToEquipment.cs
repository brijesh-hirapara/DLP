using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncDataAddedToEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "Qualifications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "Qualifications",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "Qualifications",
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

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "Equipments",
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

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

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
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EquipmentActivities");
        }
    }
}
