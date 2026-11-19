import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { CheckoutStore } from '@state/stores/checkout.store';

export const paymentResultGuard = (
  expectedStatus: PaymentStatus.Success | PaymentStatus.Failure,
): CanActivateFn => {
  return () => {
    const checkoutStore = inject(CheckoutStore);
    const router = inject(Router);
    const canAccess =
      expectedStatus === PaymentStatus.Success
        ? checkoutStore.hasSuccessfulPayment()
        : checkoutStore.hasFailedPayment();

    return canAccess ? true : router.createUrlTree(['/pagamento']);
  };
};
