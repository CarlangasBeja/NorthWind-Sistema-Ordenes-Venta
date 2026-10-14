using NorthWind.Sales.Entities.Dtos.CreateOrder;
namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
public interface ICreateOrderInputPort { Task Handle(CreateOrderDto orderDto); }
