using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ShipmentAssignTruckAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ShipmentAssignTrucks",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedById",
                table: "ShipmentAssignTrucks",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ShipmentAssignTrucks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ShipmentAssignTrucks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "ShipmentAssignTrucks",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedById",
                table: "ShipmentAssignTrucks",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ShipmentAssignTrucks");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "ShipmentAssignTrucks");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ShipmentAssignTrucks");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ShipmentAssignTrucks");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "ShipmentAssignTrucks");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "ShipmentAssignTrucks");
        }
    }
}
