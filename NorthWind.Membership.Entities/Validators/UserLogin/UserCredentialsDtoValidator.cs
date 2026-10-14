using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Entities.Resources;
using NorthWind.Validation.Entities.Abstractions;
using NorthWind.Validation.Entities.Interfaces;
namespace NorthWind.Membership.Entities.Validators.UserLogin;
internal sealed class UserCredentialsDtoValidator : AbstractModelValidator<UserCredentialsDto>
{
    public UserCredentialsDtoValidator(IValidationService<UserCredentialsDto> validationService) : base(validationService)
    {
        AddRuleFor(u=>u.Email).NotEmpty(UserLoginMessages.RequiredEmailErrorMessage).EmailAddress(UserLoginMessages.InvalidEmailErrorMessage);
        AddRuleFor(u=>u.Password).NotEmpty(UserLoginMessages.RequiredPasswordErrorMessage);
    }
}
