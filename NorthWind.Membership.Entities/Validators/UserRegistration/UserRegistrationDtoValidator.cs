using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Membership.Entities.Resources;
using NorthWind.Validation.Entities.Abstractions;
using NorthWind.Validation.Entities.Interfaces;
namespace NorthWind.Membership.Entities.Validators.UserRegistration;
internal sealed class UserRegistrationDtoValidator : AbstractModelValidator<UserRegistrationDto>
{
    public UserRegistrationDtoValidator(IValidationService<UserRegistrationDto> validationService) : base(validationService)
    {
        AddRuleFor(u=>u.FirstName).NotEmpty(UserRegistrationMessages.RequiredFirstNameErrorMessage);
        AddRuleFor(u=>u.LastName).NotEmpty(UserRegistrationMessages.RequiredLastNameErrorMessage);
        AddRuleFor(u=>u.Email).NotEmpty(UserRegistrationMessages.RequiredEmailErrorMessage).EmailAddress(UserRegistrationMessages.InvalidEmailErrorMessage);
        AddRuleFor(u=>u.Password).StopOnFirstFailure()
          .NotEmpty(UserRegistrationMessages.RequiredPasswordErrorMessage)
          .MinimumLength(6, UserRegistrationMessages.PasswordTooShortErrorMessage)
          .Must(p=>p.Any(char.IsLower), UserRegistrationMessages.PasswordRequiresLowerErrorMessage)
          .Must(p=>p.Any(char.IsUpper), UserRegistrationMessages.PasswordRequiresUpperErrorMessage)
          .Must(p=>p.Any(char.IsDigit), UserRegistrationMessages.PasswordRequiresDigitErrorMessage)
          .Must(p=>p.Any(c=>!char.IsLetterOrDigit(c)), UserRegistrationMessages.PasswordRequiresNonAlphanumericErrorMessage);
    }
}
