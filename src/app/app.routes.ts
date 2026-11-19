import { Routes } from '@angular/router';
import { paymentResultGuard } from '@core/guards/payment-result.guard';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { CheckoutLayout } from './components/checkout-layout/checkout-layout';

export const routes: Routes = [
  {
    path: '',
    component: CheckoutLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pagamento' },
      {
        path: 'pagamento',
        title: 'Pagamento | Checkout',
        loadComponent: () => import('./pages/payment/payment').then((page) => page.PaymentPage),
      },
      {
        path: 'sucesso',
        title: 'Pagamento confirmado | Checkout',
        canActivate: [paymentResultGuard(PaymentStatus.Success)],
        loadComponent: () => import('./pages/success/success').then((page) => page.SuccessPage),
      },
      {
        path: 'erro',
        title: 'Pagamento não concluído | Checkout',
        canActivate: [paymentResultGuard(PaymentStatus.Failure)],
        loadComponent: () => import('./pages/error/error').then((page) => page.ErrorPage),
      },
      { path: '**', redirectTo: 'pagamento' },
    ],
  },
];
