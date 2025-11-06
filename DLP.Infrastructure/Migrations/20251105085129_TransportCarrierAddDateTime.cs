using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TransportCarrierAddDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EstimatedPickupDateTime",
                table: "TransportCarriers",
                newName: "EstimatedPickupDateTimeTo");

            migrationBuilder.RenameColumn(
                name: "EstimatedDeliveryDateTime",
                table: "TransportCarriers",
                newName: "EstimatedPickupDateTimeFrom");

            migrationBuilder.AddColumn<DateTime>(
                name: "EstimatedDeliveryDateTimeFrom",
                table: "TransportCarriers",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EstimatedDeliveryDateTimeTo",
                table: "TransportCarriers",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedDeliveryDateTimeFrom",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "EstimatedDeliveryDateTimeTo",
                table: "TransportCarriers");

            migrationBuilder.RenameColumn(
                name: "EstimatedPickupDateTimeTo",
                table: "TransportCarriers",
                newName: "EstimatedPickupDateTime");

            migrationBuilder.RenameColumn(
                name: "EstimatedPickupDateTimeFrom",
                table: "TransportCarriers",
                newName: "EstimatedDeliveryDateTime");
        }
    }
}
