import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { MembershipGateway } from '../../core/gateways/membership.gateway';
import { FieldErrors, TextRules } from '../../core/validation/field-errors';

/** Angular version of UserLoginPage + UserLoginComponent + UserLoginViewModel. */
@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly gateway = inject(MembershipGateway);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected showPassword = false;
  protected readonly isBusy = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly errors = signal(new FieldErrors());
  private submitted = false;

  protected onFieldChange(): void {
    if (this.submitted) {
      this.errors.set(this.validate());
    }
  }

  protected async login(): Promise<void> {
    if (this.isBusy()) return;
    this.submitted = true;
    this.errorMessage.set('');

    const errors = this.validate();
    this.errors.set(errors);
    if (!errors.isEmpty) return;

    try {
      this.isBusy.set(true);
      const tokens = await this.gateway.login({ email: this.email.trim(), password: this.password });
      this.auth.login(tokens);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.isNetworkError) {
        this.errorMessage.set('No pudimos comunicarnos con el servicio de acceso. Verifique su conexión y vuelva a intentarlo en unos segundos.');
      } else if (apiError.status === 400 || apiError.isUnauthorized) {
        // The API answers 400 with a ProblemDetails when the credentials do not match.
        this.errorMessage.set('El correo o la contraseña no coinciden con una cuenta registrada. Revise los datos e intente nuevamente.');
      } else {
        this.errorMessage.set('Ocurrió un problema inesperado al iniciar sesión. Sus datos no se han modificado; puede volver a intentarlo.');
      }
    } finally {
      this.isBusy.set(false);
    }
  }

  // UserCredentialsDtoValidator
  private validate(): FieldErrors {
    const errors = new FieldErrors();
    if (!this.email.trim()) {
      errors.add('Email', 'Ingrese su correo electrónico.');
    } else if (!TextRules.isEmail(this.email)) {
      errors.add('Email', 'Ingrese un correo electrónico válido, por ejemplo nombre@correo.com.');
    }
    if (!this.password) {
      errors.add('Password', 'Ingrese su contraseña.');
    }
    return errors;
  }
}
