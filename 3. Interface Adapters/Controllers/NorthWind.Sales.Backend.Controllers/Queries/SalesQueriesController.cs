using Microsoft.AspNetCore.Http;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Queries;
using NorthWind.Sales.Entities.ValueObjects;

namespace Microsoft.AspNetCore.Builder;

public static class SalesQueriesController
{
    public static WebApplication UseSalesQueriesController(this WebApplication app)
    {
        app.MapGet(Endpoints.SearchCustomers, SearchCustomers).RequireAuthorization();
        app.MapGet(Endpoints.SearchProducts, SearchProducts).RequireAuthorization();
        app.MapGet(Endpoints.SearchOrders, SearchOrders).RequireAuthorization();
        app.MapGet(Endpoints.GetOrderInvoice, GetOrderInvoice).RequireAuthorization();
        app.MapGet(Endpoints.GetOrderPdf, GetOrderPdf).RequireAuthorization();
        return app;
    }

    private static async Task<IResult> SearchCustomers(
        string? search,
        string? field,
        int page,
        int pageSize,
        ISalesQueriesInputPort inputPort) =>
        Results.Ok(await inputPort.SearchCustomers(search, field, page, pageSize));

    private static async Task<IResult> SearchProducts(
        string? search,
        string? field,
        int page,
        int pageSize,
        ISalesQueriesInputPort inputPort) =>
        Results.Ok(await inputPort.SearchProducts(search, field, page, pageSize));

    private static async Task<IResult> SearchOrders(
        string? search,
        string? field,
        int page,
        int pageSize,
        ISalesQueriesInputPort inputPort) =>
        Results.Ok(await inputPort.SearchOrders(search, field, page, pageSize));

    private static async Task<IResult> GetOrderInvoice(
        int orderId,
        ISalesQueriesInputPort inputPort)
    {
        var invoice = await inputPort.GetOrderInvoice(orderId);
        return invoice is null
            ? Results.NotFound(new { message = "No se encontró la factura solicitada." })
            : Results.Ok(invoice);
    }

    private static async Task<IResult> GetOrderPdf(
        int orderId,
        bool? download,
        ISalesQueriesInputPort inputPort)
    {
        var invoice = await inputPort.GetOrderInvoice(orderId);
        if (invoice is null)
        {
            return Results.NotFound(new { message = "No se encontró la factura solicitada." });
        }

        var pdf = NorthWind.Sales.Backend.Controllers.Queries.InvoicePdfBuilder.Build(invoice);
        return Results.File(
            pdf,
            "application/pdf",
            (download ?? false) ? $"{invoice.InvoiceNumber}.pdf" : null,
            enableRangeProcessing: true);
    }
}
