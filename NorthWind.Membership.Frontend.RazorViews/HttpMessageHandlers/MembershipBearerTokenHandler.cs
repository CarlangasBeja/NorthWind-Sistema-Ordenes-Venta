using System.Net;
using System.Net.Http.Headers;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.HttpMessageHandlers;

internal class MembershipBearerTokenHandler(ITokenStorage storage) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var tokens = await storage.GetTokensAsync();
        if (tokens is not null && !string.IsNullOrWhiteSpace(tokens.AccessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        }

        var response = await base.SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            await storage.RemoveTokensAsync();
        }
        return response;
    }
}
