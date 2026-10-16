using System.Net.Http.Json;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Sales.Entities.ValueObjects;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

namespace NorthWind.Sales.Frontend.WebApiGateways.CreateOrder;

internal class CreateOrderGateway(HttpClient client) : ICreateOrderGateway
{
    public async Task<int> CreateOrderAsync(CreateOrderDto order)
    {
        var Response = await client.PostAsJsonAsync(
            Endpoints.CreateOrder, order);

        // No interpretar los cuerpos de error (400/401/500) como un ID de orden.
        // Ante un fallo SMTP + rollback, el usuario ve un error, no un éxito falso.
        Response.EnsureSuccessStatusCode();
        return await Response.Content.ReadFromJsonAsync<int>();
    }
}
