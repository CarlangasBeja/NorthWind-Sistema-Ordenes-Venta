using NorthWind.Entities.Interfaces; using NorthWind.Sales.Backend.SmtpGateways; using NorthWind.Sales.Backend.SmtpGateways.Options;
namespace Microsoft.Extensions.DependencyInjection; public static class DependencyContainer { public static IServiceCollection AddMailServices(this IServiceCollection s,Action<SmtpOptions> c){s.AddSingleton<IMailService,MailService>();s.Configure(c);return s;} }
