using Microsoft.AspNetCore.Builder;
using NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Controllers.UserLogin;
internal static class UserLoginController
{
 public static WebApplication UseUserLoginController(this WebApplication app){app.MapPost(Endpoints.Login,async(UserCredentialsDto dto,IUserLoginInputPort input,IUserLoginOutputPort presenter)=>{await input.Handle(dto);return presenter.Result;});return app;}
}
