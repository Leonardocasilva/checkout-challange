import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IPaymentError } from '@shared/interfaces/IPaymentError';
import { CheckoutStore } from '@state/stores/checkout.store';
import { ErrorPage } from './error';

const declined: IPaymentError = {
  code: 'PAYMENT_DECLINED',
  message: 'Seu banco recusou esta transação.',
  details: {
    product: CHECKOUT_PRODUCT,
    method: PaymentMethod.Debit,
    amountInCents: 7990,
    orderId: 'NX-12345678',
    cardBrand: 'Visa',
    cardLastFourDigits: '0002',
  },
};

describe('Tela de erro', () => {
  let store: InstanceType<typeof CheckoutStore>;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(CheckoutStore);
  });

  function fail(error = declined, method = PaymentMethod.Debit) {
    store.selectPaymentMethod(method);
    store.startPayment();
    store.failPayment(error);
    const fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();
    return fixture;
  }

  it('deve mostrar o motivo e os dados da tentativa sem tratá-la como pagamento aprovado', () => {
    const fixture = fail();
    const card = fixture.nativeElement.querySelector('.error-card') as HTMLElement;
    expect(card.textContent).toContain('Cartão não autorizado');
    expect(card.textContent).toContain(declined.message);
    expect(card.textContent).toContain('Nexo Pro');
    expect(card.textContent).toContain('#NX-12345678');
    expect(card.textContent).toContain('Débito · Visa •••• 0002');
    expect(card.textContent?.replace(/\s+/g, ' ')).toContain('R$ 79,90');
    expect(card.textContent).toContain('Total a pagar');
    expect(card.textContent).not.toContain('Total pago');
    expect(card.querySelector('time')).toBeNull();
  });

  it('deve exibir falhas sem detalhes sem inventar pedido ou dados de cartão', () => {
    const fixture = fail({ code: 'PAYMENT_ERROR', message: 'Tente novamente.' }, PaymentMethod.Pix);
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Falha no processamento');
    expect(content).toContain('Tente novamente.');
    expect(content).toContain('Nexo Pro');
    expect(content).toContain('Pix');
    expect(content).not.toContain('Pedido');
    expect(content).not.toContain('••••');
    expect(content).not.toContain('undefined');
  });

  it('deve atualizar os dados a partir da nova falha no SignalStore', () => {
    const fixture = fail();
    store.selectPaymentMethod(PaymentMethod.Credit);
    store.startPayment();
    store.failPayment({
      ...declined,
      details: {
        ...declined.details!,
        method: PaymentMethod.Credit,
        amountInCents: 4990,
        orderId: 'NX-87654321',
      },
    });
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(content).toContain('R$ 49,90');
    expect(content).toContain('#NX-87654321');
    expect(content).toContain('Crédito · Visa •••• 0002');
    expect(content).not.toContain('#NX-12345678');
  });

  it('deve oferecer retornos distintos para tentar novamente e escolher outro meio', () => {
    const fixture = fail();
    const links = fixture.nativeElement.querySelectorAll(
      '.error-actions a',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(links[0].getAttribute('href')).toBe('/pagamento');
    expect(links[1].getAttribute('href')).toBe('/pagamento?escolherMeio=true');
  });

  it('deve remover a falha e voltar ao pagamento quando o estado for limpo', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = fail();
    store.resetCheckout();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.error-card')).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/pagamento', { replaceUrl: true });
  });
});
