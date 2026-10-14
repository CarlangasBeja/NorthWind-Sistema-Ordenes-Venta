using Microsoft.AspNetCore.Http;
using NorthWind.Membership.Backend.Core.Extensions;
using NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
using NorthWind.Membership.Backend.Core.Resources;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Presenters.UserRegistration;
internal sealed class UserRegistrationPresenter:IUserRegistrationOutputPort
{
 public IResult Result{get;private set;}=Results.Ok();
 public Task Handle(Result<IEnumerable<ValidationError>> r){r.HandleResult(e=>Result=Results.Problem(e.ToProblemDetails(UserRegistrationMessages.UserRegistrationErrorTitle,UserRegistrationMessages.UserRegistrationErrorDetail,nameof(UserRegistrationPresenter))),()=>Result=Results.Ok());return Task.CompletedTask;}
}
