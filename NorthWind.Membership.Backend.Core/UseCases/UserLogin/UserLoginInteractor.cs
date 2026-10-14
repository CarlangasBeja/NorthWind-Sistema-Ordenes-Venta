using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Interfaces.Common;
using NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
using NorthWind.Membership.Backend.Core.Resources;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.UseCases.UserLogin;
internal sealed class UserLoginInteractor(IMembershipService membershipService,IUserLoginOutputPort presenter,IModelValidatorHub<UserCredentialsDto> validationService):IUserLoginInputPort
{
 public async Task Handle(UserCredentialsDto userData)
 {
  Result<UserDto,IEnumerable<ValidationError>> result;
  if(!await validationService.Validate(userData)) result=new(validationService.Errors);
  else { var user=await membershipService.GetUserByCredentials(userData); result=user is null ? new([new ValidationError(nameof(userData.Password),UserLoginMessages.InvalidUserCredentialsErrorMessage)]) : new(user); }
  await presenter.Handle(result);
 }
}
