import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { MembershipGateway } from '../../core/gateways/membership.gateway';
import { FieldErrors, TextRules } from '../../core/validation/field-errors';

/** Angular version of UserRegistrationPage + UserRegistrationComponent + UserRegistrationViewModel. */
@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly gateway = inject(MembershipGateway);

  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected password = '';
  protected passwordConfirmation = '';
  protected showPassword = false;
  protected readonly isBusy = signal(false);
  protected readonly informationMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly errors = signal(new FieldErrors());
  private submitted = false;

  protected get hasMinimumLength(): boolean { return this.password.length >= 6; }
  protected get hasUppercase(): boolean { return /\p{Lu}/u.test(this.password); }
  protected get hasLowercase(): boolean { return /\p{Ll}/u.test(this.password); }
  protected get hasDigit(): boolean { return /\d/.test(this.password); }
  protected get hasSpecial(): boolean { return /[^\p{L}\p{N}]/u.test(this.password); }
  protected get passwordsMatch(): boolean {
    return this.password.length > 0 && this.password === this.passwordConfirmation;
  }

  protected onFieldChange(): void {
    if (this.submitted) {
      this.errors.set(this.validate());
    }
  }

  protected clearMessages(): void {
    this.informationMessage.set('');
    this.errorMessage.set('');
  }

  protected async register(): Promise<void> {
    if (this.isBusy()) return;
    this.submitted = true;
    this.clearMessages();

    const errors = this.validate();
    this.errors.set(errors);
    if (!errors.isEmpty) return;

    try {
      this.isBusy.set(true);
      await this.gateway.register({
        email: this.email.trim(),
        password: this.password,
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
      });
      this.informationMessage.set('Su cuenta fue creada correctamente. Ya puede iniciar sesión con el correo y la contraseña registrados.');
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.hasValidationErrors) {
        this.errors.set(FieldErrors.from(apiError.errors));
        this.errorMessage.set('Hay información que necesita corrección. Revise los campos marcados y vuelva a intentarlo.');
      } else if (apiError.status === 409 || /correo|email/i.test(apiError.message)) {
        this.errorMessage.set('No se pudo registrar ese correo. Es posible que ya exista una cuenta con la misma dirección.');
      } else if (apiError.isNetworkError) {
        this.errorMessage.set('No pudimos crear la cuenta en este momento. Verifique su conexión y vuelva a intentarlo.');
      } else {
        this.errorMessage.set('Ocurrió un problema inesperado al crear la cuenta. No se realizó ningún registro; puede volver a intentarlo.');
      }
    } finally {
      this.isBusy.set(false);
    }
  }

  // UserRegistrationDtoValidator + UserRegistrationViewModelValidator
  private validate(): FieldErrors {
    const errors = new FieldErrors();
    if (!this.firstName.trim()) errors.add('FirstName', 'Ingrese sus nombres.');
    if (!this.lastName.trim()) errors.add('LastName', 'Ingrese sus apellidos.');
    if (!this.email.trim()) {
      errors.add('Email', 'Ingrese su correo electrónico.');
    } else if (!TextRules.isEmail(this.email)) {
      errors.add('Email', 'Ingrese un correo electrónico válido, por ejemplo nombre@correo.com.');
    }

    if (!this.password) errors.add('Password', 'Cree una contraseña.');
    else if (!this.hasMinimumLength) errors.add('Password', 'La contraseña debe tener al menos 6 caracteres.');
    else if (!this.hasLowercase) errors.add('Password', 'La contraseña debe incluir al menos una letra minúscula.');
    else if (!this.hasUppercase) errors.add('Password', 'La contraseña debe incluir al menos una letra mayúscula.');
    else if (!this.hasDigit) errors.add('Password', 'La contraseña debe incluir al menos un número.');
    else if (!this.hasSpecial) errors.add('Password', 'La contraseña debe incluir al menos un carácter especial.');

    if (this.passwordConfirmation !== this.password) {
      errors.add('PasswordConfirmation', 'Las contraseñas no coinciden. Escríbalas nuevamente.');
    }
    return errors;
  }
}
