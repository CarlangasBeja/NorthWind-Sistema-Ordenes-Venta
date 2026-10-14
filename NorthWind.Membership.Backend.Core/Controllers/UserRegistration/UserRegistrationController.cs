using Microsoft.AspNetCore.Builder;
using NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Membership.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Controllers.UserRegistration;
internal static class UserRegistrationController
{
 public static WebApplication UseUserRegistrationController(this WebApplication app){app.MapPost(Endpoints.Register,async(UserRegistrationDto dto,IUserRegistrationInputPort input,IUserRegistrationOutputPort presenter)=>{await input.Handle(dto);return presenter.Result;});return app;}
}
