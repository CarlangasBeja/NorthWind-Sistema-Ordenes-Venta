using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.BusinessObjects.ValueObjects;
using NorthWind.Sales.Backend.Repositories.Interfaces;
using NorthWind.Sales.Entities.Dtos.Queries;
using NorthWind.Sales.Entities.ValueObjects;

namespace NorthWind.Sales.Backend.Repositories.Repositories;

internal sealed class QueriesRepository(INorthWindSalesQueriesDataContext context) : IQueriesRepository
{
    public async Task<decimal?> GetCustomerCurrentBalance(string customerId)
    {
        var query = context.Customers
            .Where(customer => customer.Id == customerId)
            .Select(customer => (decimal?)customer.CurrentBalance);
        return await context.FirstOrDefaultAync(query);
    }

    public async Task<CustomerSearchItemDto?> GetCustomerById(string customerId)
    {
        var query = context.Customers.Where(c => c.Id == customerId)
            .Select(c => new CustomerSearchItemDto(c.Id, c.Name, c.CurrentBalance));
        return await context.FirstOrDefaultAync(query);
    }

    public async Task<IReadOnlyList<ProductSearchItemDto>> GetProductsByIds(IEnumerable<int> productIds)
    {
        var ids = productIds.Distinct().ToArray();
        var query = context.Products.Where(p => ids.Contains(p.Id))
            .Select(p => new ProductSearchItemDto(p.Id, p.Name, p.UnitPrice, p.UnitsInStock));
        return (await context.ToListAsync(query)).ToArray();
    }

    public async Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds)
    {
        var ids = productIds.Distinct().ToList();
        var query = context.Products
            .Where(product => ids.Contains(product.Id))
            .Select(product => new ProductUnitsInStock(product.Id, product.UnitsInStock));
        return await context.ToListAsync(query);
    }

    public async Task<PagedResultDto<CustomerSearchItemDto>> SearchCustomers(string? search, string? field, int page, int pageSize)
    {
        var term = (search ?? string.Empty).Trim();
        var query = context.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(term))
        {
            query = (field ?? "all").ToLowerInvariant() switch
            {
                "code" => query.Where(customer => customer.Id.Contains(term)),
                "name" => query.Where(customer => customer.Name.Contains(term)),
                _ => query.Where(customer => customer.Id.Contains(term) || customer.Name.Contains(term))
            };
        }

        query = query.OrderBy(customer => customer.Name);
        var total = await context.CountAsync(query);
        var itemsQuery = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(customer => new CustomerSearchItemDto(
                customer.Id,
                customer.Name,
                customer.CurrentBalance));

        var items = await context.ToListAsync(itemsQuery);
        return new PagedResultDto<CustomerSearchItemDto>(items, page, pageSize, total);
    }

    public async Task<PagedResultDto<ProductSearchItemDto>> SearchProducts(string? search, string? field, int page, int pageSize, bool includeOutOfStock = false)
    {
        var term = (search ?? string.Empty).Trim();
        var hasNumericTerm = int.TryParse(term, out var productId);

        var query = includeOutOfStock
            ? context.Products.AsQueryable()
            : context.Products.Where(product => product.UnitsInStock > 0);

        if (!string.IsNullOrWhiteSpace(term))
        {
            query = (field ?? "all").ToLowerInvariant() switch
            {
                "id" => hasNumericTerm
                    ? query.Where(product => product.Id == productId)
                    : query.Where(product => false),
                "name" => query.Where(product => product.Name.Contains(term)),
                _ => query.Where(product => product.Name.Contains(term) || (hasNumericTerm && product.Id == productId))
            };
        }

        query = query.OrderBy(product => product.Name);
        var total = await context.CountAsync(query);
        var itemsQuery = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(product => new ProductSearchItemDto(
                product.Id,
                product.Name,
                product.UnitPrice,
                product.UnitsInStock));

        var items = await context.ToListAsync(itemsQuery);
        return new PagedResultDto<ProductSearchItemDto>(items, page, pageSize, total);
    }

    public async Task<PagedResultDto<OrderSearchItemDto>> SearchOrders(string? search, string? field, int page, int pageSize)
    {
        var term = (search ?? string.Empty).Trim();
        var normalizedInvoice = term.StartsWith("INV-", StringComparison.OrdinalIgnoreCase)
            ? term[4..]
            : term;
        var hasOrderNumber = int.TryParse(normalizedInvoice, out var orderId);

        var baseQuery =
            from order in context.Orders
            join customer in context.Customers on order.CustomerId equals customer.Id
            select new { order, customer };

        if (!string.IsNullOrWhiteSpace(term))
        {
            baseQuery = (field ?? "all").ToLowerInvariant() switch
            {
                "invoice" => hasOrderNumber
                    ? baseQuery.Where(item => item.order.Id == orderId)
                    : baseQuery.Where(item => false),
                "customercode" => baseQuery.Where(item => item.customer.Id.Contains(term)),
                "customername" => baseQuery.Where(item => item.customer.Name.Contains(term)),
                _ => baseQuery.Where(item =>
                    (hasOrderNumber && item.order.Id == orderId) ||
                    item.customer.Id.Contains(term) ||
                    item.customer.Name.Contains(term))
            };
        }

        baseQuery = baseQuery.OrderByDescending(item => item.order.Id);
        var total = await context.CountAsync(baseQuery);

        var headers = await context.ToListAsync(
            baseQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(item => new
                {
                    item.order.Id,
                    item.order.CustomerId,
                    CustomerName = item.customer.Name,
                    item.order.OrderDate
                }));

        var headerList = headers.ToList();
        var orderIds = headerList.Select(item => item.Id).ToList();
        var detailTotals = await context.ToListAsync(
            context.OrderDetails
                .Where(detail => orderIds.Contains(detail.OrderId))
                .GroupBy(detail => detail.OrderId)
                .Select(group => new
                {
                    OrderId = group.Key,
                    Subtotal = group.Sum(detail => detail.UnitPrice * detail.Quantity)
                }));

        var totalsByOrder = detailTotals.ToDictionary(item => item.OrderId, item => item.Subtotal);
        var items = headerList.Select(item =>
        {
            var subtotal = totalsByOrder.GetValueOrDefault(item.Id);
            var tax = decimal.Round(subtotal * SalesConstants.TaxRate, 2, MidpointRounding.AwayFromZero);
            return new OrderSearchItemDto(
                item.Id,
                SalesConstants.GetInvoiceNumber(item.Id),
                item.CustomerId,
                item.CustomerName,
                item.OrderDate,
                subtotal,
                tax,
                subtotal + tax);
        });

        return new PagedResultDto<OrderSearchItemDto>(items, page, pageSize, total);
    }

    public async Task<OrderInvoiceDto?> GetOrderInvoice(int orderId)
    {
        var headerQuery =
            from order in context.Orders
            join customer in context.Customers on order.CustomerId equals customer.Id
            where order.Id == orderId
            select new
            {
                order.Id,
                order.OrderDate,
                order.CustomerId,
                CustomerName = customer.Name,
                order.ShipAddress,
                order.ShipCity,
                order.ShipCountry,
                order.ShipPostalCode
            };

        var header = await context.FirstOrDefaultAync(headerQuery);
        if (header is null)
        {
            return null;
        }

        var detailQuery =
            from detail in context.OrderDetails
            join product in context.Products on detail.ProductId equals product.Id
            where detail.OrderId == orderId
            orderby product.Name
            select new OrderInvoiceDetailDto(
                detail.ProductId,
                product.Name,
                detail.UnitPrice,
                detail.Quantity,
                detail.UnitPrice * detail.Quantity);

        var details = (await context.ToListAsync(detailQuery)).ToArray();
        var subtotal = details.Sum(detail => detail.Subtotal);
        var tax = decimal.Round(subtotal * SalesConstants.TaxRate, 2, MidpointRounding.AwayFromZero);

        return new OrderInvoiceDto(
            header.Id,
            SalesConstants.GetInvoiceNumber(header.Id),
            header.OrderDate,
            header.CustomerId,
            header.CustomerName,
            header.ShipAddress,
            header.ShipCity,
            header.ShipCountry,
            header.ShipPostalCode,
            subtotal,
            tax,
            subtotal + tax,
            details);
    }
}
