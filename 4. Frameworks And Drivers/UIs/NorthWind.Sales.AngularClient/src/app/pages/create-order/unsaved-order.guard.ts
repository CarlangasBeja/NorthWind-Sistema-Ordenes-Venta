import { CanDeactivateFn } from '@angular/router';
import { CreateOrderPage } from './create-order-page';

/**
 * Angular version of <NavigationLock> in CreateOrderComponent: leaving the page
 * with an unsaved order first asks for confirmation.
 */
export const unsavedOrderGuard: CanDeactivateFn<CreateOrderPage> = (page) => page.confirmLeave();
