import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/** Angular version of NorthWind.Sales.BlazorClient/Pages/Home.razor. */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly auth = inject(AuthService);
}
