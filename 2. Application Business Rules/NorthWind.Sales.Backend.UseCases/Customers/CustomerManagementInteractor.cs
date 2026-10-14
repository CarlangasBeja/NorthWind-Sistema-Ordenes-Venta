using NorthWind.Entities.Guards;
using NorthWind.Entities.Interfaces;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Entities.Dtos.Customers;

namespace NorthWind.Sales.Backend.UseCases.Customers;

/// <summary>Registro y saldo pendiente. Solo usuarios autenticados; los roles requieren política adicional.</summary>
internal sealed class CustomerManagementInteractor(
    ICommandsRepository repository,
    IUserService userService) : ICustomerManagementInputPort
{
    public async Task<CustomerOperationResult> Create(CustomerWriteDto customer)
    {
        GuardUser.AgainstUnauthenticated(userService);
        if (customer is null) return new(false, "Debe enviar los datos del cliente.");
        var id = (customer.Id ?? string.Empty).Trim().ToUpperInvariant();
        var name = (customer.Name ?? string.Empty).Trim();
        if (id.Length != 5 || !id.All(char.IsLetterOrDigit))
            return new(false, "El código debe tener exactamente 5 letras o números, sin espacios.");
        if (name.Length is < 3 or > 60)
            return new(false, "El nombre debe contener entre 3 y 60 caracteres.");
        if (!IsValidBalance(customer.CurrentBalance))
            return new(false, "El saldo pendiente debe estar entre $0,00 y $999.999,99.");
        if (await repository.CustomerExists(id))
            return new(false, $"Ya existe un cliente con el código {id}.");
        await repository.CreateCustomer(id, name, customer.CurrentBalance);
        await repository.SaveChanges();
        return new(true, $"Cliente {id} registrado correctamente.");
    }

    public async Task<CustomerOperationResult> UpdateBalance(string customerId, CustomerBalanceDto model)
    {
        GuardUser.AgainstUnauthenticated(userService);
        var id = (customerId ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(id) || model is null || !IsValidBalance(model.CurrentBalance))
            return new(false, "Debe indicar un código válido y un saldo entre $0,00 y $999.999,99.");
        var changed = await repository.UpdateCustomerBalance(id, model.CurrentBalance);
        if (!changed) return new(false, "No se encontró el cliente solicitado.");
        return new(true, model.CurrentBalance == 0
            ? $"El cliente {id} ahora no tiene deuda pendiente y puede comprar."
            : $"Saldo pendiente de {id} actualizado: $ {model.CurrentBalance:N2}. No podrá realizar nuevas compras hasta pagar.");
    }

    private static bool IsValidBalance(decimal value) => value is >= 0 and <= 999999.99m;
}
