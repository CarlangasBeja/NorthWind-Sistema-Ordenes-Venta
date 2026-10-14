namespace NorthWind.Membership.Entities.Resources;
public static class UserRegistrationMessages
{
    public const string RequiredFirstNameErrorMessage="El nombre es obligatorio.";
    public const string RequiredLastNameErrorMessage="El apellido es obligatorio.";
    public const string RequiredEmailErrorMessage="El correo es obligatorio.";
    public const string InvalidEmailErrorMessage="El formato del correo no es válido.";
    public const string RequiredPasswordErrorMessage="La contraseña es obligatoria.";
    public const string PasswordTooShortErrorMessage="La contraseña debe contener al menos 6 caracteres.";
    public const string PasswordRequiresLowerErrorMessage="La contraseña debe incluir al menos una letra minúscula.";
    public const string PasswordRequiresUpperErrorMessage="La contraseña debe incluir al menos una letra mayúscula.";
    public const string PasswordRequiresDigitErrorMessage="La contraseña debe incluir al menos un número.";
    public const string PasswordRequiresNonAlphanumericErrorMessage="La contraseña debe incluir al menos un carácter especial.";
}
