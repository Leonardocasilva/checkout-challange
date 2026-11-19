import { computed, inject } from '@angular/core';
import { PaymentSimulationService } from '@core/services/payment-simulation.service';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { ICheckoutState } from '@shared/interfaces/ICheckoutState';
import { IPaymentError } from '@shared/interfaces/IPaymentError';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { PaymentRequest } from '@shared/types/PaymentRequest';
import { EMPTY, Subject, defer, exhaustMap, pipe, takeUntil } from 'rxjs';

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
    product: computed(() => CHECKOUT_PRODUCT),
    isProcessing: computed(() => store.paymentStatus() === PaymentStatus.Processing),
    hasSuccessfulPayment: computed(
      () => store.paymentStatus() === PaymentStatus.Success && store.paymentSummary() !== null,
    ),
    hasFailedPayment: computed(
      () => store.paymentStatus() === PaymentStatus.Failure && store.paymentError() !== null,
    ),
  })),
  withMethods((store) => {
    const service = inject(PaymentSimulationService);
    const cancelPayment$ = new Subject<void>();
    const methods = {
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
        cancelPayment$.next();
        patchState(store, initialState);
      },
      cancelPayment(): void {
        if (!store.isProcessing()) return;
        cancelPayment$.next();
        patchState(store, { ...initialState, selectedMethod: store.selectedMethod() });
      },
    };

    return {
      ...methods,
      processPayment: rxMethod<PaymentRequest>(
        pipe(
          exhaustMap((request) => {
            if (request.method !== store.selectedMethod() || !methods.startPayment()) return EMPTY;

            return defer(() => service.process(request)).pipe(
              takeUntil(cancelPayment$),
              tapResponse({
                next: methods.completePayment,
                error: (error: unknown) => {
                  const knownError = error as Partial<IPaymentError> | null;
                  methods.failPayment({
                    code: typeof knownError?.code === 'string' ? knownError.code : 'PAYMENT_ERROR',
                    message:
                      typeof knownError?.message === 'string'
                        ? knownError.message
                        : 'Não foi possível processar o pagamento. Tente novamente.',
                  });
                },
              }),
            );
          }),
        ),
      ),
    };
  }),
);
