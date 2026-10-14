using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NorthWind.HttpDelegatingHandlers;
using NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;
using NorthWind.Membership.Frontend.RazorViews.HttpMessageHandlers;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;
using NorthWind.Membership.Frontend.RazorViews.Services;
using NorthWind.Membership.Frontend.RazorViews.ViewModels.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;
using NorthWind.Membership.Frontend.RazorViews.WebApiGateways;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddMembershipServices(
        this IServiceCollection services,
        Action<HttpClient> configureHttpClient)
    {
        services.AddExceptionDelegatingHandler();
        services.AddHttpClient<MembershipGateway>(configureHttpClient)
            .AddHttpMessageHandler<ExceptionDelegatingHandler>();

        services.AddScoped<UserRegistrationViewModel>();
        services.AddMembershipValidators();
        services.AddModelValidator<UserRegistrationViewModel,
            UserRegistrationViewModelDtoValidator>();
        services.AddModelValidator<UserRegistrationViewModel,
            UserRegistrationViewModelValidator>();

        services.AddScoped<UserLoginViewModel>();
        services.AddModelValidator<UserLoginViewModel,
            UserLoginViewModelDtoValidator>();

        services.AddAuthorizationCore();
        services.AddScoped<ITokenStorage, TokenLocalStorage>();
        services.AddScoped<JWTAuthenticationStateProvider>();
        services.AddScoped<AuthenticationStateProvider>(provider =>
            provider.GetService<JWTAuthenticationStateProvider>());

        return services;
    }

    public static IHttpClientBuilder AddMembershipBearerTokenHandler(
        this IHttpClientBuilder builder)
    {
        builder.Services.TryAddTransient<MembershipBearerTokenHandler>();
        builder.AddHttpMessageHandler<MembershipBearerTokenHandler>();

        return builder;
    }
}
