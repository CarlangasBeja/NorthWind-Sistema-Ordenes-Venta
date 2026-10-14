using NorthWind.Sales.Backend.BusinessObjects.Aggregates;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
namespace NorthWind.Sales.Backend.Presenters.CreateOrder;
internal class CreateOrderPresenter:ICreateOrderOutputPort { public int OrderId{get;private set;} public Task Handle(OrderAggregate addedOrder){OrderId=addedOrder.Id;return Task.CompletedTask;} }
