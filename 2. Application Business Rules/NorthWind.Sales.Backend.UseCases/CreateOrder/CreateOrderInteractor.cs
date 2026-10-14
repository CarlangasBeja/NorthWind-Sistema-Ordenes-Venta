using Microsoft.Extensions.Logging;
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

// Prácticas 9, 10, 11 y 12: evento de dominio, auditoría, transacción y Specification.
// El correo del administrador se resuelve en el gateway; jamás se pide al comprador.
internal sealed class CreateOrderInteractor(
    ICreateOrderOutputPort outputPort,
    ICommandsRepository repository,
    IQueriesRepository queriesRepository,
    IModelValidatorHub<CreateOrderDto> modelValidatorHub,
    IDomainEventHub<SpecialOrderCreatedEvent> domainEventHub,
    IDomainLogger domainLogger,
    IDomainTransaction domainTransaction,
    IUserService userService,
    ILogger<CreateOrderInteractor> logger) : ICreateOrderInputPort
{
    public async Task Handle(CreateOrderDto orderDto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, orderDto);

        // La auditoría vive en otra base: se escribe FUERA de la transacción de ventas
        // para no forzar una transacción distribuida (MSDTC) entre dos LocalDB.
        await TryAudit(new DomainLog(
            CreateOrderMessages.StartingPurchaseOrderCreation, userService.UserName));

        var order = OrderAggregate.From(orderDto);
        bool specialOrder = new SpecialOrderSpecification().IsSatisfiedBy(order);

        // Resolvemos los nombres reales antes de la transacción de escritura.
        // Así Gmail presenta el catálogo existente en SQL Server, no etiquetas genéricas.
        string customerName = string.Empty;
        IReadOnlyDictionary<int, string> productNames = new Dictionary<int, string>();
        if (specialOrder)
        {
            var customer = await queriesRepository.GetCustomerById(order.CustomerId)
                ?? throw new InvalidOperationException("No se encontró el cliente de la orden.");
            customerName = customer.Name;
            var products = await queriesRepository.GetProductsByIds(order.OrderDetails.Select(x => x.ProductId));
            productNames = products.ToDictionary(p => p.Id, p => p.Name);
            if (productNames.Count != order.OrderDetails.Count)
                throw new InvalidOperationException("No se encontraron todos los productos seleccionados.");
        }

        try
        {
            domainTransaction.BeginTransaction();

            // Guardado provisional de la orden, sus detalles y descuento de inventario.
            // SaveChanges participa en la transacción ambiente: aún NO se confirma.
            await repository.CreateOrder(order);
            await repository.SaveChanges();

            if (specialOrder)
            {
                // Más de tres productos DIFERENTES. El agregado fusiona IDs repetidos.
                // Si el SMTP rechaza el envío, Raise lanza una excepción y la transacción
                // se revierte: la orden y la reducción de stock no se confirman.
                var specialEvent = new SpecialOrderCreatedEvent(
                    order.Id,
                    order.OrderDetails.Count,
                    order.CustomerId,
                    customerName,
                    order.ShipAddress,
                    order.ShipCity,
                    order.ShipCountry,
                    order.ShipPostalCode,
                    order.OrderDate,
                    order.OrderDetails.Select(item =>
                        new SpecialOrderProduct(item.ProductId, productNames[item.ProductId], item.Quantity)).ToArray());

                await domainEventHub.Raise(specialEvent);
            }

            // La transacción se confirma SOLAMENTE si la persistencia y, cuando aplica,
            // el envío SMTP terminaron correctamente.
            domainTransaction.CommitTransaction();
        }
        catch (Exception ex)
        {
            // Si falló SMTP, la orden creada provisionalmente y el stock se revierten.
            try
            {
                domainTransaction.RollbackTransaction();
            }
            catch (Exception rollbackEx)
            {
                logger.LogError(rollbackEx,
                    "Ocurrió un error al revertir la orden {OrderId}.", order.Id);
            }

            logger.LogError(ex,
                "Creación de orden {OrderId} cancelada. Orden especial: {SpecialOrder}.",
                order.Id, specialOrder);

            await TryAudit(new DomainLog(
                string.Format(CreateOrderMessages.OrderCreationCancelledTemplate, order.Id),
                userService.UserName));
            throw;
        }

        // La confirmación y el mensaje al usuario ocurren sólo después del commit.
        await TryAudit(new DomainLog(
            string.Format(CreateOrderMessages.PurchaseOrderCreatedTemplate, order.Id),
            userService.UserName));

        if (specialOrder)
        {
            logger.LogInformation(
                "Orden especial {OrderId} confirmada; el proveedor SMTP aceptó el correo dirigido al administrador.",
                order.Id);
            await TryAudit(new DomainLog(
                $"Notificación de orden especial {order.Id} aceptada por el servidor SMTP.",
                userService.UserName));
        }

        await outputPort.Handle(order);
    }

    // Un problema en la BD independiente de auditoría no crea una venta duplicada
    // ni oculta la excepción real del servidor de correo.
    private async Task TryAudit(DomainLog log)
    {
        try
        {
            await domainLogger.LogInformation(log);
        }
        catch (Exception auditEx)
        {
            logger.LogWarning(auditEx,
                "No fue posible escribir un registro de auditoría en NorthWindLogsDB.");
        }
    }
}
