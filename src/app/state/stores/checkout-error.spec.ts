import { TestBed } from '@angular/core/testing';
import { PaymentSimulationService } from '@core/services/payment-simulation.service';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { throwError } from 'rxjs';
import { CheckoutStore } from './checkout.store';

describe('Falhas no estado do checkout', () => {
  let store: InstanceType<typeof CheckoutStore>;
  beforeEach(() => {
    vi.useFakeTimers();
    store = TestBed.inject(CheckoutStore);
  });
  afterEach(() => vi.useRealTimers());

  function decline() {
    store.selectPaymentMethod(PaymentMethod.Debit);
    store.processPayment({
      method: PaymentMethod.Debit,
      card: { number: '4000000000000002', holder: 'Marina Almeida', expiry: '12/39', cvv: '123' },
    });
    vi.advanceTimersByTime(1600);
  }

  it('deve conservar somente os dados seguros da tentativa recusada', () => {
    decline();
    expect(store.hasFailedPayment()).toBe(true);
    expect(store.hasSuccessfulPayment()).toBe(false);
    expect(store.paymentSummary()).toBeNull();
    expect(store.paymentMethodDescription()).toBe('Débito · Visa •••• 0002');
    expect(store.failedPaymentDetails()).toEqual({
      product: CHECKOUT_PRODUCT,
      method: PaymentMethod.Debit,
      amountInCents: 7990,
      orderId: expect.stringMatching(/^NX-[A-F0-9]{8}$/),
      cardBrand: 'Visa',
      cardLastFourDigits: '0002',
    });
    const serialized = JSON.stringify(store.paymentError());
    expect(serialized).not.toContain('4000000000000002');
    expect(serialized).not.toContain('cvv');
    expect(serialized).not.toContain('Marina');
  });

  it('deve limpar os dados recusados na troca de meio e aceitar uma nova aprovação', () => {
    decline();
    store.selectPaymentMethod(PaymentMethod.Pix);
    expect(store.failedPaymentDetails()).toBeNull();
    expect(store.paymentMethodDescription()).toBe('');
    store.processPayment({ method: PaymentMethod.Pix });
    vi.advanceTimersByTime(1600);
    expect(store.hasSuccessfulPayment()).toBe(true);
    expect(store.paymentError()).toBeNull();
    expect(store.paymentMethodDescription()).toBe('Pix');
    expect(store.paymentSummary()).not.toHaveProperty('cardLastFourDigits');
  });

  it('deve recuperar o produto e o meio selecionado quando a falha não tem detalhes', () => {
    vi.spyOn(TestBed.inject(PaymentSimulationService), 'process').mockReturnValue(
      throwError(() => null),
    );
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment({ method: PaymentMethod.Pix });
    expect(store.paymentError()?.code).toBe('PAYMENT_ERROR');
    expect(store.failedPaymentDetails()).toEqual({
      product: CHECKOUT_PRODUCT,
      method: PaymentMethod.Pix,
      amountInCents: 7990,
    });
    store.resetCheckout();
    expect(store.failedPaymentDetails()).toBeNull();
  });
});
