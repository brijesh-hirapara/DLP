using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTransportCarrier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportInformations_Codebooks_CurrencyId",
                table: "TransportInformations");

            migrationBuilder.AlterColumn<Guid>(
                name: "CurrencyId",
                table: "TransportInformations",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddColumn<DateTime>(
                name: "EstimatedDeliveryDateTime",
                table: "TransportCarriers",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EstimatedPickupDateTime",
                table: "TransportCarriers",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OfferValidityDate",
                table: "TransportCarriers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "TransportCarriers",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "TransportCarriers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TruckTypeId",
                table: "TransportCarriers",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_TransportCarriers_TruckTypeId",
                table: "TransportCarriers",
                column: "TruckTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransportCarriers_Codebooks_TruckTypeId",
                table: "TransportCarriers",
                column: "TruckTypeId",
                principalTable: "Codebooks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TransportInformations_Codebooks_CurrencyId",
                table: "TransportInformations",
                column: "CurrencyId",
                principalTable: "Codebooks",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportCarriers_Codebooks_TruckTypeId",
                table: "TransportCarriers");

            migrationBuilder.DropForeignKey(
                name: "FK_TransportInformations_Codebooks_CurrencyId",
                table: "TransportInformations");

            migrationBuilder.DropIndex(
                name: "IX_TransportCarriers_TruckTypeId",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "EstimatedDeliveryDateTime",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "EstimatedPickupDateTime",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "OfferValidityDate",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "TransportCarriers");

            migrationBuilder.DropColumn(
                name: "TruckTypeId",
                table: "TransportCarriers");

            migrationBuilder.AlterColumn<Guid>(
                name: "CurrencyId",
                table: "TransportInformations",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci",
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true)
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddForeignKey(
                name: "FK_TransportInformations_Codebooks_CurrencyId",
                table: "TransportInformations",
                column: "CurrencyId",
                principalTable: "Codebooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
