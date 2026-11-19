import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PaymentSimulationService } from '@core/services/payment-simulation.service';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { CheckoutStore } from '@state/stores/checkout.store';
import { Subject } from 'rxjs';
import { routes } from './app.routes';

describe('Rotas do checkout', () => {
  let harness: RouterTestingHarness;
  let store: InstanceType<typeof CheckoutStore>;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    store = TestBed.inject(CheckoutStore);
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it.each(['/', '/rota-inexistente', '/sucesso', '/erro'])(
    'deve direcionar %s para pagamento quando não existe resultado',
    async (url) => {
      await harness.navigateByUrl(url);

      expect(router.url).toBe('/pagamento');
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
        'Finalize sua assinatura',
      );
    },
  );

  it('deve liberar somente a tela de sucesso após uma aprovação', async () => {
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.startPayment();
    store.completePayment({
      product: {
        id: 'nexo-pro',
        name: 'Nexo Pro',
        description: 'Plano mensal',
        priceInCents: 7990,
      },
      method: PaymentMethod.Pix,
      amountInCents: 7990,
    });

    await harness.navigateByUrl('/sucesso');
    expect(router.url).toBe('/sucesso');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      'Pagamento confirmado!',
    );

    await harness.navigateByUrl('/erro');
    expect(router.url).toBe('/pagamento');

    store.resetCheckout();
    await harness.navigateByUrl('/sucesso');
    expect(router.url).toBe('/pagamento');
  });

  it('deve exibir a falha registrada e impedir o acesso à tela de sucesso', async () => {
    store.selectPaymentMethod(PaymentMethod.Credit);
    store.startPayment();
    store.failPayment({ code: 'PAYMENT_DECLINED', message: 'Pagamento não autorizado.' });

    await harness.navigateByUrl('/erro');
    expect(router.url).toBe('/erro');
    expect(harness.routeNativeElement?.textContent).toContain('Pagamento não autorizado.');

    await harness.navigateByUrl('/sucesso');
    expect(router.url).toBe('/pagamento');
  });

  it('deve limpar a falha ao voltar para o pagamento pela tela de erro', async () => {
    store.selectPaymentMethod(PaymentMethod.Debit);
    store.startPayment();
    store.failPayment({ code: 'PAYMENT_DECLINED', message: 'Pagamento não autorizado.' });
    await harness.navigateByUrl('/erro');

    const backLink = harness.routeNativeElement?.querySelector(
      '.error-page a',
    ) as HTMLAnchorElement;
    backLink.click();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/pagamento');
    expect(store.paymentError()).toBeNull();
    expect(store.hasFailedPayment()).toBe(false);
  });

  it('deve exibir o processamento e navegar para sucesso ao receber a aprovação', async () => {
    const response = new Subject<IPaymentSummary>();
    vi.spyOn(TestBed.inject(PaymentSimulationService), 'process').mockReturnValue(response);
    await harness.navigateByUrl('/pagamento');
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment({ method: PaymentMethod.Pix });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      'Processando seu pagamento',
    );
    expect(harness.routeNativeElement?.querySelector('form.card-form')).toBeNull();
    response.next({ product: CHECKOUT_PRODUCT, method: PaymentMethod.Pix, amountInCents: 7990 });
    response.complete();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/sucesso');
    expect(store.paymentSummary()?.amountInCents).toBe(7990);
  });

  it('deve navegar para erro após recusa e permitir uma nova seleção no retorno', async () => {
    const response = new Subject<IPaymentSummary>();
    vi.spyOn(TestBed.inject(PaymentSimulationService), 'process').mockReturnValue(response);
    await harness.navigateByUrl('/pagamento');
    store.selectPaymentMethod(PaymentMethod.Pix);
    store.processPayment({ method: PaymentMethod.Pix });
    response.error({ code: 'PAYMENT_DECLINED', message: 'Pagamento recusado.' });
    await harness.fixture.whenStable();
    expect(router.url).toBe('/erro');
    await harness.navigateByUrl('/pagamento');
    store.selectPaymentMethod(PaymentMethod.Debit);
    expect(store.hasFailedPayment()).toBe(false);
    expect(store.selectedMethod()).toBe(PaymentMethod.Debit);
  });
});
