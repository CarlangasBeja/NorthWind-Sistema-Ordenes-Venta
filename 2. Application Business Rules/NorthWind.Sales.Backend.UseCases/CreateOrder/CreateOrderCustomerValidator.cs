using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.UseCases.Resources;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Validation.Entities.Enums;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Sales.Backend.UseCases.CreateOrder;
internal class CreateOrderCustomerValidator(IQueriesRepository repository) : IModelValidator<CreateOrderDto>
{
    readonly List<ValidationError> ErrorsField=[];
    public IEnumerable<ValidationError> Errors=>ErrorsField;
    public ValidationConstraint Constraint=>ValidationConstraint.ValidateIfThereAreNoPreviousErrors;
    public async Task<bool> Validate(CreateOrderDto model)
    {
        ErrorsField.Clear(); var balance=await repository.GetCustomerCurrentBalance(model.CustomerId);
        if(balance==null) ErrorsField.Add(new(nameof(model.CustomerId),CreateOrderMessages.CustomerIdNotFoundError));
        else if(balance>0) ErrorsField.Add(new(nameof(model.CustomerId),string.Format(CreateOrderMessages.CustomerWithBalanceErrorTemplate,model.CustomerId,balance)));
        return !ErrorsField.Any();
    }
}
