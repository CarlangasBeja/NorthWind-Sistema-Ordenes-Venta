using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Sales.Validators.Entities.Resources;
using NorthWind.Validation.Entities.Abstractions;
using NorthWind.Validation.Entities.Interfaces;

namespace NorthWind.Sales.Validators.Entities.CreateOrder;

internal class CreateOrderDtoValidator : AbstractModelValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator(
        IValidationService<CreateOrderDto> validationService,
        IModelValidator<CreateOrderDetailDto> detailValidator) : base(validationService)
    {
        AddRuleFor(order => order.CustomerId)
            .NotEmpty(CreateOrderMessages.CustomerIdRequired)
            .Length(5, CreateOrderMessages.CustomerIdRequiredLength);

        AddRuleFor(order => order.ShipAddress)
            .NotEmpty(CreateOrderMessages.ShipAddressRequired)
            .MaximumLength(60, CreateOrderMessages.ShipAddressMaximumLength);

        AddRuleFor(order => order.ShipCity)
            .NotEmpty(CreateOrderMessages.ShipCityRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCityMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCityMaximumLength)
            .Must(IsTextValue, "City must contain letters and valid separators only.");

        AddRuleFor(order => order.ShipCountry)
            .NotEmpty(CreateOrderMessages.ShipCountryRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCountryMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCountryMaximumLength)
            .Must(IsTextValue, "Country must contain letters and valid separators only.");

        AddRuleFor(order => order.ShipPostalCode)
            .MaximumLength(10, CreateOrderMessages.ShipPostalCodeMaximumLength);

        AddRuleFor(order => order.OrderDetails)
            .NotNull(CreateOrderMessages.OrderDetailsRequired)
            .NotEmpty(CreateOrderMessages.OrderDetailsNotEmpty)
            .Must(
                details => details is null || details.GroupBy(detail => detail.ProductId).All(group => group.Count() == 1),
                "A product can only appear once in the order.");

        AddRuleForEach(order => order.OrderDetails).SetValidator(detailValidator);
    }

    private static bool IsTextValue(string value) =>
        string.IsNullOrWhiteSpace(value) ||
        value.All(character => char.IsLetter(character) || char.IsWhiteSpace(character) || character is '-' or '.');
}
