using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Backend.BusinessObjects.ValueObjects;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
namespace NorthWind.Sales.Backend.BusinessObjects.Aggregates;
public class OrderAggregate : Order
{
    readonly List<OrderDetail> OrderDetailsField = [];
    public IReadOnlyCollection<OrderDetail> OrderDetails => OrderDetailsField;
    public void AddOrderDetail(int productId, decimal unitPrice, short quantity)
    {
        var current = OrderDetailsField.FirstOrDefault(d => d.ProductId == productId);
        if (current == null) OrderDetailsField.Add(new(productId, unitPrice, quantity));
        else
        {
            OrderDetailsField.Remove(current);
            OrderDetailsField.Add(new(productId, unitPrice, checked((short)(current.Quantity + quantity))));
        }
    }
    public static OrderAggregate From(CreateOrderDto orderDto)
    {
        var order = new OrderAggregate
        {
            CustomerId = orderDto.CustomerId, ShipAddress = orderDto.ShipAddress,
            ShipCity = orderDto.ShipCity, ShipCountry = orderDto.ShipCountry,
            ShipPostalCode = orderDto.ShipPostalCode
        };
        foreach (var d in orderDto.OrderDetails) order.AddOrderDetail(d.ProductId,d.UnitPrice,d.Quantity);
        return order;
    }
}
