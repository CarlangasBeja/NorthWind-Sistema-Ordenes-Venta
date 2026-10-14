using Microsoft.Extensions.DependencyInjection;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Membership.Entities.Validators.UserLogin;
using NorthWind.Membership.Entities.Validators.UserRegistration;
namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddMembershipValidators(this IServiceCollection services)
    {
        services.AddModelValidator<UserRegistrationDto,UserRegistrationDtoValidator>();
        services.AddModelValidator<UserCredentialsDto,UserCredentialsDtoValidator>();
        return services;
    }
}
