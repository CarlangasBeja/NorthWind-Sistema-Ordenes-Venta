using NorthWind.DomainLogs.Entities.Interfaces;
using NorthWind.DomainLogs.Entities.ValueObjects;
using NorthWind.Entities.Guards;
using NorthWind.Entities.Interfaces;
using NorthWind.Events.Entities.Interfaces;
using NorthWind.Sales.Backend.BusinessObjects.Aggregates;
using NorthWind.Sales.Backend.BusinessObjects.Guards;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.BusinessObjects.Specifications;
using NorthWind.Sales.Backend.UseCases.Resources;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Transactions.Entities.Interfaces;
using NorthWind.Validation.Entities.Interfaces;
namespace NorthWind.Sales.Backend.UseCases.CreateOrder;
internal class CreateOrderInteractor(ICreateOrderOutputPort outputPort,ICommandsRepository repository,IModelValidatorHub<CreateOrderDto> modelValidatorHub,IDomainEventHub<SpecialOrderCreatedEvent> domainEventHub,IDomainLogger domainLogger,IDomainTransaction domainTransaction,IUserService userService):ICreateOrderInputPort
{
    public async Task Handle(CreateOrderDto orderDto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub,orderDto);
        await domainLogger.LogInformation(new DomainLog(CreateOrderMessages.StartingPurchaseOrderCreation,userService.UserName));
        OrderAggregate order=OrderAggregate.From(orderDto);
        try
        {
            domainTransaction.BeginTransaction();
            await repository.CreateOrder(order); await repository.SaveChanges();
            await domainLogger.LogInformation(new DomainLog(string.Format(CreateOrderMessages.PurchaseOrderCreatedTemplate,order.Id),userService.UserName));
            await outputPort.Handle(order);
            if(new SpecialOrderSpecification().IsSatisfiedBy(order)) await domainEventHub.Raise(new SpecialOrderCreatedEvent(order.Id,order.OrderDetails.Count));
            domainTransaction.CommitTransaction();
        }
        catch
        {
            domainTransaction.RollbackTransaction();
            await domainLogger.LogInformation(new DomainLog(string.Format(CreateOrderMessages.OrderCreationCancelledTemplate,order.Id),userService.UserName));
            throw;
        }
    }
}
