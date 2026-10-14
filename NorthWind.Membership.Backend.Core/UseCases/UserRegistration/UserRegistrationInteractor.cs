using NorthWind.Membership.Backend.Core.Interfaces.Common;
using NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;
namespace NorthWind.Membership.Backend.Core.UseCases.UserRegistration;
internal sealed class UserRegistrationInteractor(IMembershipService membershipService,IUserRegistrationOutputPort presenter,IModelValidatorHub<UserRegistrationDto> validationService):IUserRegistrationInputPort
{
 public async Task Handle(UserRegistrationDto userData)
 {
  Result<IEnumerable<ValidationError>> result;
  if(!await validationService.Validate(userData)) result=new(validationService.Errors);
  else result=await membershipService.Register(userData);
  await presenter.Handle(result);
 }
}
