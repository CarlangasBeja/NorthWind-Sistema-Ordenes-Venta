import { Component } from '@angular/core';

/** NotFound content of the Blazor App.razor router. */
@Component({
  selector: 'app-not-found-page',
  template: `
    <div class="alert alert-warning mt-4">
      <h1 class="h4">Página no encontrada</h1>
      <p class="mb-0">La dirección solicitada no existe. Use el menú de navegación para continuar.</p>
    </div>
  `,
})
export class NotFoundPage {}
