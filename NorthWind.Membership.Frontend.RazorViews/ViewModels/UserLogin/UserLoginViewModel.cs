using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;
using NorthWind.Membership.Frontend.RazorViews.WebApiGateways;
using NorthWind.RazorComponents.Validators;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Membership.Frontend.RazorViews.ViewModels.UserLogin;

public class UserLoginViewModel(
    MembershipGateway gateway,
    IModelValidatorHub<UserLoginViewModel> validator,
    JWTAuthenticationStateProvider authenticationStateProvider)
{
    public IModelValidatorHub<UserLoginViewModel> Validator => validator;
    public ModelValidator<UserLoginViewModel> ModelValidatorComponentReference { get; set; } = null!;
    public event Action? OnLogin;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ErrorMessage { get; private set; } = string.Empty;
    public bool IsBusy { get; private set; }

    public async Task Login()
    {
        if (IsBusy) return;
        ErrorMessage = string.Empty;

        try
        {
            IsBusy = true;
            var tokens = await gateway.LoginAsync((UserCredentialsDto)this);
            await authenticationStateProvider.LoginAsync(tokens);
            OnLogin?.Invoke();
        }
        catch (HttpRequestException ex)
        {
            if (ex.Data.Contains("Errors") && ex.Data["Errors"] is IEnumerable<ValidationError> errors)
            {
                ModelValidatorComponentReference.AddErrors(errors);
                ErrorMessage = "Revise los campos marcados. El correo debe tener un formato válido y la contraseña no puede estar vacía.";
            }
            else if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                ErrorMessage = "El correo o la contraseña no coinciden con una cuenta registrada. Revise los datos e intente nuevamente.";
            }
            else
            {
                ErrorMessage = "No pudimos comunicarnos con el servicio de acceso. Verifique su conexión y vuelva a intentarlo en unos segundos.";
            }
        }
        catch
        {
            ErrorMessage = "Ocurrió un problema inesperado al iniciar sesión. Sus datos no se han modificado; puede volver a intentarlo.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    public void ClearMessages() => ErrorMessage = string.Empty;

    public static explicit operator UserCredentialsDto(UserLoginViewModel model) =>
        new(model.Email, model.Password);
}
