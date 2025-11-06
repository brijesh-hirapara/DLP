using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TransportRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TransportRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RequestId = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Accessibility = table.Column<int>(type: "int", nullable: false),
                    TotalDistance = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    IsTemplate = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TemplateName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_TransportRequests", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TransportCarriers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OrganizationId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportCarriers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportCarriers_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportCarriers_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TransportDeliverys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CountryId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    City = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyAddress = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PostalCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TransportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportDeliverys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportDeliverys_Codebooks_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Codebooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportDeliverys_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TransportGoods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TypeOfGoodsId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Length = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Width = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Height = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    IsIncludesAdrGoods = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsCargoNotStackable = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TransportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportGoods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportGoods_Codebooks_TypeOfGoodsId",
                        column: x => x.TypeOfGoodsId,
                        principalTable: "Codebooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportGoods_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TransportInformations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DateSelectionOption = table.Column<int>(type: "int", nullable: false),
                    PickupDateFrom = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PickupDateTo = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PickupTimeFrom = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    PickupTimeTo = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    DeliveryDateFrom = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeliveryDateTo = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeliveryTimeFrom = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    DeliveryTimeTo = table.Column<TimeSpan>(type: "time(6)", nullable: true),
                    CurrencyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportInformations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportInformations_Codebooks_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Codebooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportInformations_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TransportPickups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CompanyName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CountryId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    City = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyAddress = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PostalCode = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TransportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransportRequestId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportPickups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportPickups_Codebooks_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Codebooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportPickups_TransportRequests_TransportRequestId",
                        column: x => x.TransportRequestId,
                        principalTable: "TransportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_TransportCarriers_OrganizationId",
                table: "TransportCarriers",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportCarriers_TransportRequestId",
                table: "TransportCarriers",
                column: "TransportRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportDeliverys_CountryId",
                table: "TransportDeliverys",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportDeliverys_TransportRequestId",
                table: "TransportDeliverys",
                column: "TransportRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportGoods_TransportRequestId",
                table: "TransportGoods",
                column: "TransportRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportGoods_TypeOfGoodsId",
                table: "TransportGoods",
                column: "TypeOfGoodsId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportInformations_CurrencyId",
                table: "TransportInformations",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportInformations_TransportRequestId",
                table: "TransportInformations",
                column: "TransportRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportPickups_CountryId",
                table: "TransportPickups",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportPickups_TransportRequestId",
                table: "TransportPickups",
                column: "TransportRequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransportCarriers");

            migrationBuilder.DropTable(
                name: "TransportDeliverys");

            migrationBuilder.DropTable(
                name: "TransportGoods");

            migrationBuilder.DropTable(
                name: "TransportInformations");

            migrationBuilder.DropTable(
                name: "TransportPickups");

            migrationBuilder.DropTable(
                name: "TransportRequests");
        }
    }
}
