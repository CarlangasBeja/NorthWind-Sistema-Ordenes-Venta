using NorthWind.Exceptions.Entities.Exceptions;
using NorthWind.Sales.Backend.BusinessObjects.Aggregates;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace NorthWind.Sales.Backend.Repositories.Repositories;

internal class CommandsRepository(INorthWindSalesCommandsDataContext context) : ICommandsRepository
{
    public async Task CreateOrder(OrderAggregate order)
    {
        var details = new List<NorthWind.Sales.Backend.Repositories.Entities.OrderDetail>();

        foreach (var detail in order.OrderDetails)
        {
            var updated = await context.DecreaseProductStockAsync(detail.ProductId, detail.Quantity);
            if (!updated)
            {
                throw new UpdateException(
                    $"Product {detail.ProductId} no longer has enough stock. Refresh the product list and try again.");
            }

            var currentUnitPrice = await context.GetProductUnitPriceAsync(detail.ProductId);
            if (!currentUnitPrice.HasValue)
            {
                throw new UpdateException($"Product {detail.ProductId} is no longer available.");
            }

            details.Add(new NorthWind.Sales.Backend.Repositories.Entities.OrderDetail
            {
                Order = order,
                ProductId = detail.ProductId,
                Quantity = detail.Quantity,
                UnitPrice = currentUnitPrice.Value
            });
        }

        await context.AddOrderAsync(order);
        await context.AddOrderDetailsAsync(details);
    }

    public async Task SaveChanges() =>
        await context.SaveChangesAsync();
}
