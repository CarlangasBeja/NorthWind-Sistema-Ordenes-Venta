using Microsoft.AspNetCore.Http;
using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Extensions;
using NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
using NorthWind.Membership.Backend.Core.Resources;
using NorthWind.Membership.Backend.Core.Services;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.Presenters.UserLogin;
internal sealed class UserLoginPresenter(JwtService service):IUserLoginOutputPort
{
 public IResult Result{get;private set;}=Results.Unauthorized();
 public Task Handle(Result<UserDto,IEnumerable<ValidationError>> r){r.HandleResult(u=>Result=Results.Ok(new TokensDto(service.GetToken(u))),e=>Result=Results.Problem(e.ToProblemDetails(UserLoginMessages.UserLoginErrorTitle,UserLoginMessages.UserLoginErrorDetail,nameof(UserLoginPresenter))));return Task.CompletedTask;}
}
