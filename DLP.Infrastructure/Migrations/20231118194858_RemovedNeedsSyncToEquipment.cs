using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedNeedsSyncToEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "SyncAction",
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
                name: "SyncAction",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "EquipmentActivities");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Equipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "EquipmentActivities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "EquipmentActivities",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }
    }
}
