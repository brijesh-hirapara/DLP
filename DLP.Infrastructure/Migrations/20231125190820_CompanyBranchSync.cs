using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CompanyBranchSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionTakenBy",
                table: "CompanyBranches",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncAt",
                table: "CompanyBranches",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SyncToken",
                table: "CompanyBranches",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionTakenBy",
                table: "CompanyBranches");

            migrationBuilder.DropColumn(
                name: "LastSyncAt",
                table: "CompanyBranches");

            migrationBuilder.DropColumn(
                name: "SyncToken",
                table: "CompanyBranches");
        }
    }
}
