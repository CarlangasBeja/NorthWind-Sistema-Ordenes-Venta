using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Membership.Frontend.RazorViews.Resources;
using NorthWind.Membership.Frontend.RazorViews.WebApiGateways;
using NorthWind.RazorComponents.Validators;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;

public class UserRegistrationViewModel(
    MembershipGateway gateway,
    IModelValidatorHub<UserRegistrationViewModel> validator)
{
    public IModelValidatorHub<UserRegistrationViewModel> Validator => validator;
    public ModelValidator<UserRegistrationViewModel> ModelValidatorComponentReference { get; set; } = null!;
    public string InformationMessage { get; private set; } = string.Empty;
    public string ErrorMessage { get; private set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PasswordConfirmation { get; set; } = string.Empty;
    public bool IsBusy { get; private set; }

    public async Task Register()
    {
        if (IsBusy) return;
        InformationMessage = string.Empty;
        ErrorMessage = string.Empty;

        try
        {
            IsBusy = true;
            await gateway.RegisterAsync((UserRegistrationDto)this);
            InformationMessage = "Su cuenta fue creada correctamente. Ya puede iniciar sesión con el correo y la contraseña registrados.";
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors") && ex.Data["Errors"] is IEnumerable<ValidationError> errors)
            {
                ModelValidatorComponentReference.AddErrors(errors);
                ErrorMessage = "Hay información que necesita corrección. Revise los campos marcados y vuelva a intentarlo.";
            }
            else if (ex.StatusCode == System.Net.HttpStatusCode.Conflict ||
                     ex.Message.Contains("correo", StringComparison.OrdinalIgnoreCase) ||
                     ex.Message.Contains("email", StringComparison.OrdinalIgnoreCase))
            {
                ErrorMessage = "No se pudo registrar ese correo. Es posible que ya exista una cuenta con la misma dirección.";
            }
            else
            {
                ErrorMessage = "No pudimos crear la cuenta en este momento. Verifique su conexión y vuelva a intentarlo.";
            }
        }
        catch
        {
            ErrorMessage = "Ocurrió un problema inesperado al crear la cuenta. No se realizó ningún registro; puede volver a intentarlo.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    public void ClearMessages()
    {
        InformationMessage = string.Empty;
        ErrorMessage = string.Empty;
    }

    public static explicit operator UserRegistrationDto(UserRegistrationViewModel model) =>
        new(model.Email, model.Password, model.FirstName, model.LastName);
}
