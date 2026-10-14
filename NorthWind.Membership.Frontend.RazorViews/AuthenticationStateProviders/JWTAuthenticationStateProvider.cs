using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;

public class JWTAuthenticationStateProvider(ITokenStorage storage) : AuthenticationStateProvider
{
    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        ClaimsIdentity identity = new ClaimsIdentity();
        var tokens = await storage.GetTokensAsync();

        if (tokens is not null && !string.IsNullOrWhiteSpace(tokens.AccessToken))
        {
            try
            {
                var handler = new JsonWebTokenHandler();
                var token = handler.ReadJsonWebToken(tokens.AccessToken);

                if (token.ValidTo > DateTime.UtcNow)
                {
                    identity = new ClaimsIdentity(token.Claims, nameof(JWTAuthenticationStateProvider));
                }
                else
                {
                    await storage.RemoveTokensAsync();
                }
            }
            catch
            {
                await storage.RemoveTokensAsync();
            }
        }

        return new AuthenticationState(new ClaimsPrincipal(identity));
    }

    public async ValueTask LoginAsync(TokensDto tokens)
    {
        await storage.StoreTokensAsync(tokens);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public async ValueTask LogoutAsync()
    {
        await storage.RemoveTokensAsync();
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }
}
