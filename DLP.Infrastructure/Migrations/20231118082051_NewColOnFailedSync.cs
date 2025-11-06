using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DLP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewColOnFailedSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NotificationHandlerModel",
                table: "FailedSynchronizations",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotificationHandlerModel",
                table: "FailedSynchronizations");
        }
    }
}
