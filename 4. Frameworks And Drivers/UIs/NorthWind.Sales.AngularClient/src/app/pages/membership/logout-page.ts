import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/** Angular version of NorthWind.Membership.Frontend.RazorViews/Pages/LogoutPage.razor. */
@Component({
  selector: 'app-logout-page',
  imports: [RouterLink],
  template: `
    <div class="nw-auth-page">
      <section class="nw-auth-shell nw-logout-card text-center">
        <div class="nw-confirm-icon nw-confirm-warning mx-auto">!</div>
        <span class="nw-kicker">SEGURIDAD DE LA SESIÓN</span>
        <h1 class="h3 mt-2">¿Desea cerrar sesión?</h1>
        <p class="text-secondary">Al salir, necesitará ingresar nuevamente su correo y contraseña para registrar ventas o consultar órdenes de venta.</p>
        <div class="d-flex justify-content-center gap-2 flex-wrap mt-4">
          <a class="btn btn-outline-secondary" routerLink="/">Cancelar</a>
          <button class="btn btn-danger" type="button" (click)="closeSession()">Cerrar sesión</button>
        </div>
      </section>
    </div>
  `,
})
export class LogoutPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected closeSession(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
