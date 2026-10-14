using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.Repositories.Entities;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Services;

internal class NorthWindSalesQueriesDataContext :
    NorthWindSalesContext,
    INorthWindSalesQueriesDataContext
{
    public NorthWindSalesQueriesDataContext(IOptions<DBOptions> dbOptions)
        : base(dbOptions)
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public new IQueryable<Customer> Customers => base.Customers;
    public new IQueryable<Product> Products => base.Products;
    public new IQueryable<Order> Orders => base.Orders;
    public new IQueryable<OrderDetail> OrderDetails => base.OrderDetails;

    public Task<ReturnType?> FirstOrDefaultAync<ReturnType>(IQueryable<ReturnType> queryable) =>
        queryable.FirstOrDefaultAsync();

    public async Task<IEnumerable<ReturnType>> ToListAsync<ReturnType>(IQueryable<ReturnType> queryable) =>
        await queryable.ToListAsync();

    public Task<int> CountAsync<ReturnType>(IQueryable<ReturnType> queryable) =>
        queryable.CountAsync();
}
