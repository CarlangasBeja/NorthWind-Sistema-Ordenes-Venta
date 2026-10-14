using NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
using NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
using NorthWind.Membership.Backend.Core.Options;
using NorthWind.Membership.Backend.Core.Presenters.UserLogin;
using NorthWind.Membership.Backend.Core.Presenters.UserRegistration;
using NorthWind.Membership.Backend.Core.Services;
using NorthWind.Membership.Backend.Core.UseCases.UserLogin;
using NorthWind.Membership.Backend.Core.UseCases.UserRegistration;
using NorthWind.Membership.Entities;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddMembershipCoreServices(
        this IServiceCollection services,
        Action<JwtOptions> configureJwtOptions)
    {
        services.AddMembershipValidators();
        services.AddDefaultModelValidatorHub();

        services.AddScoped<IUserRegistrationInputPort,
            UserRegistrationInteractor>();

        services.AddScoped<IUserLoginInputPort,
            UserLoginInteractor>();

        services.AddScoped<IUserRegistrationOutputPort,
            UserRegistrationPresenter>();

        services.AddScoped<IUserLoginOutputPort,
            UserLoginPresenter>();

        services.AddSingleton<JwtService>();
        services.Configure(configureJwtOptions);

        return services;
    }
}
