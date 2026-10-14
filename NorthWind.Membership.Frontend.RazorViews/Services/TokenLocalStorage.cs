using System.Text.Json;
using Microsoft.JSInterop;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.Services;

internal class TokenLocalStorage(IJSRuntime jsRuntime) : ITokenStorage
{
    private const string StorageKey = "northwind.tokens.v3";
    private const string LegacyStorageKey = "tokens";
    private const string StoreIdentifier = "localStorage.setItem";
    private const string GetIdentifier = "localStorage.getItem";
    private const string RemoveIdentifier = "localStorage.removeItem";

    public async Task StoreTokensAsync(TokensDto tokens)
    {
        string value = JsonSerializer.Serialize(tokens);
        await jsRuntime.InvokeVoidAsync(StoreIdentifier, StorageKey, value);
        await jsRuntime.InvokeVoidAsync(RemoveIdentifier, LegacyStorageKey);
    }

    public async Task<TokensDto> GetTokensAsync()
    {
        string? value = await jsRuntime.InvokeAsync<string?>(GetIdentifier, StorageKey);
        if (string.IsNullOrWhiteSpace(value))
        {
            await jsRuntime.InvokeVoidAsync(RemoveIdentifier, LegacyStorageKey);
            return null!;
        }

        try
        {
            return JsonSerializer.Deserialize<TokensDto>(value)!;
        }
        catch
        {
            await RemoveTokensAsync();
            return null!;
        }
    }

    public async Task RemoveTokensAsync()
    {
        await jsRuntime.InvokeVoidAsync(RemoveIdentifier, StorageKey);
        await jsRuntime.InvokeVoidAsync(RemoveIdentifier, LegacyStorageKey);
    }
}
