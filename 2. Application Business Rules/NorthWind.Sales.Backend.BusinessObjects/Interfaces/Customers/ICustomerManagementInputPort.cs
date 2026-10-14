using NorthWind.Sales.Entities.Dtos.Customers;

namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Customers;

public interface ICustomerManagementInputPort
{
    Task<CustomerOperationResult> Create(CustomerWriteDto customer);
    Task<CustomerOperationResult> UpdateBalance(string customerId, CustomerBalanceDto balance);
}
