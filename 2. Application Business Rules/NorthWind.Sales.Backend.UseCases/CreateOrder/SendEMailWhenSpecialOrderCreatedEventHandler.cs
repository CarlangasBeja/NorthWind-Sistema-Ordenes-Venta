using NorthWind.Entities.Interfaces;
using NorthWind.Events.Entities.Interfaces;

namespace NorthWind.Sales.Backend.UseCases.CreateOrder;

// Maneja el evento de dominio sin conocer el proveedor de correo ni el Gmail destino.
internal sealed class SendEMailWhenSpecialOrderCreatedEventHandler(
    IMailService mailService) : IDomainEventHandler<SpecialOrderCreatedEvent>
{
    public Task Handle(SpecialOrderCreatedEvent createdOrder)
    {
        var htmlBody = SpecialOrderEmailTemplate.Build(createdOrder);
        var subject = $"NorthWind | Nueva orden especial #{createdOrder.OrderId:D6} - {createdOrder.ProductsCount} productos";
        return mailService.SendMailToAdministrator(subject, htmlBody);
    }
}
