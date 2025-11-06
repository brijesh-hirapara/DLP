using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedSyncBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Translations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Translations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Translations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasPendingSyncFiles",
                table: "Requests",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "RefrigerantTypes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "RefrigerantTypes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "RefrigerantTypes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasPendingSyncFiles",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Organizations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Organizations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Organizations",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Municipalities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Municipalities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Municipalities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Languages",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Languages",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Languages",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasPendingSyncFiles",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasPendingSyncFiles",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Codebooks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Codebooks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Codebooks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "Cantons",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Cantons",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Cantons",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Translations");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Translations");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Translations");

            migrationBuilder.DropColumn(
                name: "HasPendingSyncFiles",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "HasPendingSyncFiles",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Municipalities");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Municipalities");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Municipalities");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Languages");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Languages");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Languages");

            migrationBuilder.DropColumn(
                name: "HasPendingSyncFiles",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "HasPendingSyncFiles",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Codebooks");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Codebooks");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Codebooks");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Cantons");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Cantons");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Cantons");
        }
    }
}
