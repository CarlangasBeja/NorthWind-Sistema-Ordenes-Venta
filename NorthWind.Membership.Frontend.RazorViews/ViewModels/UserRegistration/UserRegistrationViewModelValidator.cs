using NorthWind.Membership.Frontend.RazorViews.Resources; using NorthWind.Validation.Entities.Abstractions; using NorthWind.Validation.Entities.Enums; using NorthWind.Validation.Entities.Interfaces;
namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;
internal class UserRegistrationViewModelValidator:AbstractModelValidator<UserRegistrationViewModel>
{
    public UserRegistrationViewModelValidator(IValidationService<UserRegistrationViewModel> validationService):base(validationService,ValidationConstraint.AlwaysValidate){AddRuleFor(c=>c.PasswordConfirmation).Equal(c=>c.Password,UserRegistrationMessages.ConfirmPasswordErrorMessage);}
}
