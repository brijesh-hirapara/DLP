using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class VehicleFleetORGAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "VehicleFleetRequests",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleFleetRequests_OrganizationId",
                table: "VehicleFleetRequests",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleFleetRequests_Organizations_OrganizationId",
                table: "VehicleFleetRequests",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VehicleFleetRequests_Organizations_OrganizationId",
                table: "VehicleFleetRequests");

            migrationBuilder.DropIndex(
                name: "IX_VehicleFleetRequests_OrganizationId",
                table: "VehicleFleetRequests");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "VehicleFleetRequests");
        }
    }
}
