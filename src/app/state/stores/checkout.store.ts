import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { ICheckoutState } from '@shared/interfaces/ICheckoutState';
import { IPaymentError } from '@shared/interfaces/IPaymentError';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';

const initialState: ICheckoutState = {
  selectedMethod: null,
  paymentStatus: PaymentStatus.Idle,
  paymentSummary: null,
  paymentError: null,
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isProcessing: computed(() => store.paymentStatus() === PaymentStatus.Processing),
    hasSuccessfulPayment: computed(
      () => store.paymentStatus() === PaymentStatus.Success && store.paymentSummary() !== null,
    ),
    hasFailedPayment: computed(
      () => store.paymentStatus() === PaymentStatus.Failure && store.paymentError() !== null,
    ),
  })),
  withMethods((store) => ({
    selectPaymentMethod(method: PaymentMethod): void {
      if (store.isProcessing()) return;

      patchState(store, { ...initialState, selectedMethod: method });
    },
    startPayment(): boolean {
      if (store.selectedMethod() === null || store.isProcessing()) return false;

      patchState(store, {
        paymentStatus: PaymentStatus.Processing,
        paymentSummary: null,
        paymentError: null,
      });
      return true;
    },
    completePayment(summary: IPaymentSummary): void {
      if (!store.isProcessing()) return;

      patchState(store, {
        selectedMethod: summary.method,
        paymentStatus: PaymentStatus.Success,
        paymentSummary: summary,
        paymentError: null,
      });
    },
    failPayment(error: IPaymentError): void {
      if (!store.isProcessing()) return;

      patchState(store, {
        paymentStatus: PaymentStatus.Failure,
        paymentSummary: null,
        paymentError: error,
      });
    },
    resetCheckout(): void {
      patchState(store, initialState);
    },
  })),
);
