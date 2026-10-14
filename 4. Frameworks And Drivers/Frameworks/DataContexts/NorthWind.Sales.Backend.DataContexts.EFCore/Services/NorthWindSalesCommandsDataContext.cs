using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;
using NorthWind.Sales.Backend.DataContexts.EFCore.Guards;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Services;

internal class NorthWindSalesCommandsDataContext(
    IOptions<DBOptions> dbOptions) :
    NorthWindSalesContext(dbOptions),
    INorthWindSalesCommandsDataContext
{
    public async Task AddOrderAsync(Order order) =>
        await AddAsync(order);

    public async Task AddOrderDetailsAsync(
        IEnumerable<NorthWind.Sales.Backend.Repositories.Entities.OrderDetail> orderDetails) =>
        await AddRangeAsync(orderDetails);

    public async Task<bool> DecreaseProductStockAsync(int productId, short quantity)
    {
        var affectedRows = await Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Products
            SET UnitsInStock = UnitsInStock - {quantity}
            WHERE Id = {productId}
              AND UnitsInStock >= {quantity};");

        return affectedRows == 1;
    }

    public Task<decimal?> GetProductUnitPriceAsync(int productId) =>
        Products
            .Where(product => product.Id == productId)
            .Select(product => (decimal?)product.UnitPrice)
            .FirstOrDefaultAsync();

    public async Task SaveChangesAsync() =>
        await GuardDBContext.AgainstSaveChangesErrorAsync(this);
}
