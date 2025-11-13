using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Shipments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Shipments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RequestId = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsTruckAssigned = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TruckAssignedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsPickupConfirmed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PickupConfirmedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeliveryConfirmed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DeliveryConfirmedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsPODConfirmed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PODConfirmedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ShipmentCarrierStatus = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ShipperOrganizationId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CarrierOrganizationId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shipments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shipments_Organizations_CarrierOrganizationId",
                        column: x => x.CarrierOrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Shipments_Organizations_ShipperOrganizationId",
                        column: x => x.ShipperOrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Shipments_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_CarrierOrganizationId",
                table: "Shipments",
                column: "CarrierOrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_ShipperOrganizationId",
                table: "Shipments",
                column: "ShipperOrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_TransportRequestId",
                table: "Shipments",
                column: "TransportRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Shipments");
        }
    }
}
