using NorthWind.Membership.Backend.AspNetIdentity.Options;
using NorthWind.Membership.Backend.Core.Options;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.SmtpGateways.Options;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddNorthWindSalesServices(
        this IServiceCollection services,
        Action<DBOptions> configureDBOptions,
        Action<SmtpOptions> configureSmtpOptions,
        Action<MembershipDBOptions> configureMembershipDBOptions,
        Action<JwtOptions> configureJwtOptions)
    {
        services.AddUseCasesServices()
            .AddRepositories()
            .AddDataContexts(configureDBOptions)
            .AddPresenters()
            .AddValidationService()
            .AddValidators()
            .AddValidationExceptionHandler()
            .AddUpdateExceptionHandler()
            .AddUnauthorizedAccessExceptionHandler()
            .AddUnhandledExceptionHandler()
            .AddEventServices()
            .AddMailServices(configureSmtpOptions)
            .AddDomainLogsServices()
            .AddTransactionServices()
            .AddUserServices()
            .AddMembershipCoreServices(configureJwtOptions)
            .AddMembershipIdentityServices(configureMembershipDBOptions);

        return services;
    }
}
