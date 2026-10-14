using NorthWind.Sales.Backend.BusinessObjects.Aggregates;
namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
public interface ICreateOrderOutputPort { int OrderId { get; } Task Handle(OrderAggregate addedOrder); }
