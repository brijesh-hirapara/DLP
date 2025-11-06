using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ServiceTechnicianReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChemicalFormula",
                table: "RefrigerantTypes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ImportExportSubstancesReport",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePerson = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SubmitedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId1 = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedById = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SyncToken = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastSyncAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActionTakenBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportExportSubstancesReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesReport_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesReport_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesReport_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ServiceTechnicianReport",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePerson = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SubmitedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId1 = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedById = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SyncToken = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastSyncAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActionTakenBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceTechnicianReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianReport_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianReport_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianReport_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ImportExportSubstancesAnnualReport",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ImportExportSubstancesReportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RefrigerantTypeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TariffNumber = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Import = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    OwnConsumption = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    SalesOnTheBiHMarket = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalExportedQuantity = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    StockBalanceOnTheDay = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    EndUser = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedById = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SyncToken = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastSyncAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActionTakenBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportExportSubstancesAnnualReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesAnnualReport_ImportExportSubstancesRep~",
                        column: x => x.ImportExportSubstancesReportId,
                        principalTable: "ImportExportSubstancesReport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesAnnualReport_RefrigerantTypes_Refriger~",
                        column: x => x.RefrigerantTypeId,
                        principalTable: "RefrigerantTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ImportExportSubstancesAnnualReport_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ServiceTechnicianAnnualReport",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ServiceTechnicianReportId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RefrigerantTypeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Purchased = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Collected = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Renewed = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Sold = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Used1 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Used2 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Used3 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Used4 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    StateOfSubstanceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StockBalance = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedById = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedById = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsArchived = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SyncToken = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastSyncAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ActionTakenBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceTechnicianAnnualReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianAnnualReport_RefrigerantTypes_RefrigerantTy~",
                        column: x => x.RefrigerantTypeId,
                        principalTable: "RefrigerantTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianAnnualReport_ServiceTechnicianReport_Servic~",
                        column: x => x.ServiceTechnicianReportId,
                        principalTable: "ServiceTechnicianReport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceTechnicianAnnualReport_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesAnnualReport_CreatedById",
                table: "ImportExportSubstancesAnnualReport",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesAnnualReport_ImportExportSubstancesRep~",
                table: "ImportExportSubstancesAnnualReport",
                column: "ImportExportSubstancesReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesAnnualReport_RefrigerantTypeId",
                table: "ImportExportSubstancesAnnualReport",
                column: "RefrigerantTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesReport_CreatedById",
                table: "ImportExportSubstancesReport",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesReport_OrganizationId",
                table: "ImportExportSubstancesReport",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportExportSubstancesReport_UserId1",
                table: "ImportExportSubstancesReport",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianAnnualReport_CreatedById",
                table: "ServiceTechnicianAnnualReport",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianAnnualReport_RefrigerantTypeId",
                table: "ServiceTechnicianAnnualReport",
                column: "RefrigerantTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianAnnualReport_ServiceTechnicianReportId",
                table: "ServiceTechnicianAnnualReport",
                column: "ServiceTechnicianReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianReport_CreatedById",
                table: "ServiceTechnicianReport",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianReport_OrganizationId",
                table: "ServiceTechnicianReport",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceTechnicianReport_UserId1",
                table: "ServiceTechnicianReport",
                column: "UserId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ImportExportSubstancesAnnualReport");

            migrationBuilder.DropTable(
                name: "ServiceTechnicianAnnualReport");

            migrationBuilder.DropTable(
                name: "ImportExportSubstancesReport");

            migrationBuilder.DropTable(
                name: "ServiceTechnicianReport");

            migrationBuilder.DropColumn(
                name: "ChemicalFormula",
                table: "RefrigerantTypes");
        }
    }
}
