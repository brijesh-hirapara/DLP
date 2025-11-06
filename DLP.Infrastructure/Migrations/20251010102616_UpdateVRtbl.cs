using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVRtbl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActionedAt",
                table: "VehicleFleetRequests",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActionedBy",
                table: "VehicleFleetRequests",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionedAt",
                table: "VehicleFleetRequests");

            migrationBuilder.DropColumn(
                name: "ActionedBy",
                table: "VehicleFleetRequests");
        }
    }
}
