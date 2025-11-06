using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TransportCarrierAddminPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdminApprovedPrice",
                table: "TransportCarriers",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAdminApproved",
                table: "TransportCarriers",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ProfitMargin",
                table: "TransportCarriers",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminApprovedPrice",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "IsAdminApproved",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "ProfitMargin",
                table: "TransportCarriers");
        }
    }
}
