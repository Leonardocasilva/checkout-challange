import { TestBed } from '@angular/core/testing';
import { PaymentSimulationService } from '@core/services/payment-simulation.service';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { Subject } from 'rxjs';
import { CheckoutStore } from './checkout.store';

const summary: IPaymentSummary = {
  product: CHECKOUT_PRODUCT,
  method: PaymentMethod.Pix,
  amountInCents: 7990,
  orderId: 'NX-10482',
  paidAt: new Date(2030, 10, 19, 14, 32).toISOString(),
  nextBillingAt: new Date(2030, 11, 19, 14, 32).toISOString(),
};
const request = { method: PaymentMethod.Pix } as const;

describe('Processamento no SignalStore', () => {
  let store: InstanceType<typeof CheckoutStore>;
  let response: Subject<IPaymentSummary>;
  let process: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    response = new Subject<IPaymentSummary>();
    process = vi.fn(() => response.asObservable());
    TestBed.configureTestingModule({
      providers: [{ provide: PaymentSimulationService, useValue: { process } }],
    });
    store = TestBed.inject(CheckoutStore);
  });
  it('deve ignorar envio sem seleção e envio com meio diferente do selecionado', () => {
    store.processPayment(request);
    store.selectPaymentMethod(PaymentMethod.Credit);
    store.processPayment(request);
    expect(process).not.toHaveBeenCalled();
    expect(store.isProcessing()).toBe(false);
  });
  it('deve manter somente uma operação em andamento', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    store.processPayment(request);
    store.selectPaymentMethod(PaymentMethod.Debit);
    expect(process).toHaveBeenCalledTimes(1);
    expect(store.isProcessing()).toBe(true);
    expect(store.selectedMethod()).toBe(PaymentMethod.Pix);
    response.next(summary);
    response.complete();
    expect(store.hasSuccessfulPayment()).toBe(true);
    expect(store.isProcessing()).toBe(false);
  });
  it('deve permitir nova tentativa depois de uma falha', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    response.error({ code: 'PAYMENT_DECLINED', message: 'Pagamento recusado.' });
    expect(store.hasFailedPayment()).toBe(true);
    response = new Subject<IPaymentSummary>();
    store.processPayment(request);
    expect(store.paymentError()).toBeNull();
    response.next(summary);
    response.complete();
    expect(store.hasSuccessfulPayment()).toBe(true);
    expect(process).toHaveBeenCalledTimes(2);
  });
  it('deve cancelar ao reiniciar e ignorar uma resposta antiga durante a nova tentativa', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    const oldResponse = response;
    store.resetCheckout();
    response = new Subject<IPaymentSummary>();
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    oldResponse.next(summary);
    expect(store.isProcessing()).toBe(true);
    expect(store.paymentSummary()).toBeNull();
    response.next(summary);
    expect(store.hasSuccessfulPayment()).toBe(true);
  });
  it('deve cancelar a operação ao sair, preservando o meio escolhido', () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    store.cancelPayment();
    response.next(summary);
    expect(store.isProcessing()).toBe(false);
    expect(store.paymentSummary()).toBeNull();
    expect(store.selectedMethod()).toBe(PaymentMethod.Pix);
  });
  it('deve tratar falha inesperada e manter o processamento disponível', () => {
    process.mockImplementationOnce(() => {
      throw null;
    });
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment(request);
    expect(store.paymentError()?.code).toBe('PAYMENT_ERROR');
    store.processPayment(request);
    response.next(summary);
    expect(store.hasSuccessfulPayment()).toBe(true);
  });
});
