import { TestBed } from '@angular/core/testing';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { CheckoutStore } from './checkout.store';

const summary: IPaymentSummary = {
  product: { id: 'nexo-pro', name: 'Nexo Pro', description: 'Plano mensal', priceInCents: 7990 },
  method: PaymentMethod.Pix,
  amountInCents: 7990,
};
const error = { code: 'PAYMENT_DECLINED', message: 'Pagamento não autorizado.' };

describe('Estado do checkout', () => {
  let store: InstanceType<typeof CheckoutStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(CheckoutStore);
  });

  it('deve impedir o início sem meio de pagamento e ignorar resultados sem tentativa ativa', () => {
    expect(store.startPayment()).toBe(false);
    store.completePayment(summary);
    store.failPayment(error);

    expect(store.paymentStatus()).toBe(PaymentStatus.Idle);
    expect(store.paymentSummary()).toBeNull();
    expect(store.paymentError()).toBeNull();
    expect(store.hasSuccessfulPayment()).toBe(false);
    expect(store.hasFailedPayment()).toBe(false);
  });

  it('deve bloquear novo envio e troca de meio durante o processamento', () => {
    store.selectPaymentMethod(PaymentMethod.Credit);
    expect(store.startPayment()).toBe(true);
    expect(store.startPayment()).toBe(false);

    store.selectPaymentMethod(PaymentMethod.Pix);

    expect(store.selectedMethod()).toBe(PaymentMethod.Credit);
    expect(store.isProcessing()).toBe(true);
  });

  it('deve guardar a aprovação e ignorar uma falha recebida depois da conclusão', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.startPayment();
    store.completePayment(summary);
    store.failPayment(error);

    expect(store.hasSuccessfulPayment()).toBe(true);
    expect(store.paymentSummary()).toEqual(summary);
    expect(store.paymentError()).toBeNull();
    expect(store.hasFailedPayment()).toBe(false);
    expect(store.isProcessing()).toBe(false);
  });

  it('deve limpar a falha ao iniciar uma nova tentativa com o mesmo meio', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.startPayment();
    store.failPayment(error);

    expect(store.hasFailedPayment()).toBe(true);
    expect(store.paymentError()).toEqual(error);
    expect(store.hasSuccessfulPayment()).toBe(false);
    expect(store.isProcessing()).toBe(false);

    expect(store.startPayment()).toBe(true);
    expect(store.selectedMethod()).toBe(PaymentMethod.Pix);
    expect(store.paymentError()).toBeNull();
    expect(store.hasFailedPayment()).toBe(false);

    store.completePayment(summary);
    expect(store.hasSuccessfulPayment()).toBe(true);
  });

  it('deve invalidar o resultado anterior quando outro meio for escolhido', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.startPayment();
    store.completePayment(summary);

    store.selectPaymentMethod(PaymentMethod.Debit);

    expect(store.selectedMethod()).toBe(PaymentMethod.Debit);
    expect(store.paymentStatus()).toBe(PaymentStatus.Idle);
    expect(store.paymentSummary()).toBeNull();
    expect(store.hasSuccessfulPayment()).toBe(false);
  });

  it('deve descartar os dados da compra ao reiniciar o checkout', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.startPayment();
    store.completePayment(summary);

    store.resetCheckout();

    expect(store.selectedMethod()).toBeNull();
    expect(store.paymentStatus()).toBe(PaymentStatus.Idle);
    expect(store.paymentSummary()).toBeNull();
    expect(store.paymentError()).toBeNull();
    expect(store.hasSuccessfulPayment()).toBe(false);
    expect(store.hasFailedPayment()).toBe(false);
  });
});
