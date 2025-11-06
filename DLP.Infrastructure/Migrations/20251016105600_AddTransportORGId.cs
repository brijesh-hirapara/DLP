using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportORGId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "TransportRequests",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequests_OrganizationId",
                table: "TransportRequests",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransportRequests_Organizations_OrganizationId",
                table: "TransportRequests",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportRequests_Organizations_OrganizationId",
                table: "TransportRequests");

            migrationBuilder.DropIndex(
                name: "IX_TransportRequests_OrganizationId",
                table: "TransportRequests");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "TransportRequests");
        }
    }
}
