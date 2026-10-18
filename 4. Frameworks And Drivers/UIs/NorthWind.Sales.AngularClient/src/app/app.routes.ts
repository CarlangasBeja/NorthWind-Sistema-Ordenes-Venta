import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { MainLayout } from './layout/main-layout';
import { HomePage } from './pages/home/home-page';
import { CreateOrderPage } from './pages/create-order/create-order-page';
import { unsavedOrderGuard } from './pages/create-order/unsaved-order.guard';
import { CustomersPage } from './pages/customers/customers-page';
import { ProductsPage } from './pages/products/products-page';
import { InvoicesPage } from './pages/invoices/invoices-page';
import { LoginPage } from './pages/membership/login-page';
import { RegisterPage } from './pages/membership/register-page';
import { LogoutPage } from './pages/membership/logout-page';
import { NotFoundPage } from './pages/not-found/not-found-page';

/** Same routes as the Blazor client (@page directives). */
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage, title: 'NorthWind Ventas' },
      {
        path: 'createorder',
        component: CreateOrderPage,
        canActivate: [authGuard],
        canDeactivate: [unsavedOrderGuard],
        title: 'Crear orden | NorthWind Ventas',
      },
      { path: 'CreateOrder', redirectTo: 'createorder' },
      { path: 'customers', component: CustomersPage, canActivate: [authGuard], title: 'Clientes | NorthWind' },
      { path: 'products', component: ProductsPage, canActivate: [authGuard], title: 'Productos | NorthWind' },
      { path: 'invoices', component: InvoicesPage, canActivate: [authGuard], title: 'Órdenes de venta | NorthWind Ventas' },
      { path: 'user/login', component: LoginPage, title: 'Iniciar sesión | NorthWind Ventas' },
      { path: 'user/register', component: RegisterPage, title: 'Crear cuenta | NorthWind Ventas' },
      { path: 'user/logout', component: LogoutPage, title: 'Cerrar sesión | NorthWind Ventas' },
      { path: '**', component: NotFoundPage, title: 'Página no encontrada' },
    ],
  },
];
