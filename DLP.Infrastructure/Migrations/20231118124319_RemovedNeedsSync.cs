using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedNeedsSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                name: "NeedsBetaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
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
                name: "NeedsBetaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "NeedsBetaSync",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "NeedsDeltaSync",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "NeedsGammaSync",
                table: "EmploymentHistory");

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

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Translations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "RefrigerantTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Qualifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Organizations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Municipalities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Languages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Equipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "EquipmentActivities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "EmploymentHistory",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Codebooks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SyncAction",
                table: "Cantons",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Translations");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "RefrigerantTypes");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Qualifications");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Municipalities");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Languages");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "EquipmentActivities");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "EmploymentHistory");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Codebooks");

            migrationBuilder.DropColumn(
                name: "SyncAction",
                table: "Cantons");

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
                name: "NeedsBetaSync",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Qualifications",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
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
                name: "NeedsBetaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "Equipments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "EquipmentActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsBetaSync",
                table: "EmploymentHistory",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsDeltaSync",
                table: "EmploymentHistory",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsGammaSync",
                table: "EmploymentHistory",
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
    }
}
