using System.Net.Http.Json;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Membership.Entities.ValueObjects;
namespace NorthWind.Membership.Frontend.RazorViews.WebApiGateways;
public class MembershipGateway(HttpClient client)
{
    public async Task RegisterAsync(UserRegistrationDto userData) => await client.PostAsJsonAsync(Endpoints.Register, userData);
    public async Task<TokensDto> LoginAsync(UserCredentialsDto userCredentials)
    {
        var Response = await client.PostAsJsonAsync(Endpoints.Login, userCredentials);
        return await Response.Content.ReadFromJsonAsync<TokensDto>();
    }
}
