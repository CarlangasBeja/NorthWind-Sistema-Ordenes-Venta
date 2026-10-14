using NorthWind.Membership.Backend.Core.Controllers.UserLogin;
using NorthWind.Membership.Backend.Core.Controllers.UserRegistration;

namespace Microsoft.AspNetCore.Builder;

public static class EndpointsContainer
{
    public static WebApplication UseMembershipEndpoints(this WebApplication app)
    {
        app.UseUserRegistrationController();
        app.UseUserLoginController();

        return app;
    }
}
