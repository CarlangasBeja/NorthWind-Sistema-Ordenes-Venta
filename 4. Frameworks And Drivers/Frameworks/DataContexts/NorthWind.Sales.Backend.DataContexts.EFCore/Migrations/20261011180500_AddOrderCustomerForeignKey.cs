using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;

#nullable disable

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Migrations;

[DbContext(typeof(NorthWindContext))]
[Migration("20261011180500_AddOrderCustomerForeignKey")]
public partial class AddOrderCustomerForeignKey : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_Orders_CustomerId",
            table: "Orders",
            column: "CustomerId");

        migrationBuilder.AddForeignKey(
            name: "FK_Orders_Customers_CustomerId",
            table: "Orders",
            column: "CustomerId",
            principalTable: "Customers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Orders_Customers_CustomerId",
            table: "Orders");

        migrationBuilder.DropIndex(
            name: "IX_Orders_CustomerId",
            table: "Orders");
    }
}
