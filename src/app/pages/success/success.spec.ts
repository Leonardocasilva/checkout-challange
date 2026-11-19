import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { CheckoutStore } from '@state/stores/checkout.store';
import { SuccessPage } from './success';

const payment: IPaymentSummary = {
  product: CHECKOUT_PRODUCT,
  method: PaymentMethod.Credit,
  amountInCents: 7990,
  orderId: 'NX-10482',
  paidAt: new Date(2030, 10, 19, 14, 32).toISOString(),
  nextBillingAt: new Date(2030, 11, 19, 14, 32).toISOString(),
  customerFirstName: 'MARINA',
  cardBrand: 'Visa',
  cardLastFourDigits: '4242',
};

describe('Tela de sucesso', () => {
  let store: InstanceType<typeof CheckoutStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(CheckoutStore);
  });

  function approve(summary: IPaymentSummary = payment) {
    store.selectPaymentMethod(summary.method);
    store.startPayment();
    store.completePayment(summary);
    const fixture = TestBed.createComponent(SuccessPage);
    fixture.detectChanges();
    return fixture;
  }

  it('deve exibir o produto, valor, pedido e cartão mascarado da compra aprovada', () => {
    const fixture = approve();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.confirmation-card')!;
    expect(card.textContent).toContain('Pagamento confirmado!');
    expect(card.textContent).toContain('Tudo certo, Marina.');
    expect(card.textContent).toContain('Nexo Pro');
    expect(card.textContent).toContain('Plano mensal · 1 usuário');
    expect(card.textContent).toContain('#NX-10482');
    expect(card.textContent).toContain('Crédito · Visa •••• 4242');
    expect(card.textContent?.replace(/\s+/g, ' ')).toContain('R$ 79,90');
    expect(card.querySelector('time')?.dateTime).toBe(payment.paidAt);
    expect(element.querySelector('.renewal-note')?.textContent).toContain('19/12/2030');
  });

  it('deve apresentar Pix sem nome, bandeira ou dígitos de cartão', () => {
    const fixture = approve({
      ...payment,
      method: PaymentMethod.Pix,
      customerFirstName: undefined,
      cardBrand: undefined,
      cardLastFourDigits: undefined,
    });
    const content = fixture.nativeElement.querySelector('.confirmation-card').textContent;
    expect(content).toContain('Tudo certo.');
    expect(content).toContain('Pix');
    expect(content).not.toContain('Visa');
    expect(content).not.toContain('••••');
    expect(content).not.toContain('undefined');
  });

  it('deve atualizar a confirmação e o recibo com os mesmos dados do SignalStore', () => {
    const fixture = approve();
    store.selectPaymentMethod(PaymentMethod.Debit);
    store.startPayment();
    store.completePayment({
      ...payment,
      method: PaymentMethod.Debit,
      amountInCents: 4990,
      orderId: 'NX-20482',
      cardBrand: undefined,
      cardLastFourDigits: '0005',
    });
    fixture.detectChanges();
    const receipts = fixture.nativeElement.querySelectorAll(
      'app-payment-details',
    ) as NodeListOf<HTMLElement>;
    expect(receipts).toHaveLength(2);
    for (const receipt of receipts) {
      expect(receipt.textContent).toContain('#NX-20482');
      expect(receipt.textContent).toContain('Débito · •••• 0005');
      expect(receipt.textContent?.replace(/\s+/g, ' ')).toContain('R$ 49,90');
    }
  });

  it('deve abrir o recibo e o aviso do espaço demonstrativo pelas ações da tela', () => {
    const fixture = approve();
    const element = fixture.nativeElement as HTMLElement;
    const receipt = element.querySelector<HTMLDialogElement>('.receipt-dialog')!;
    const workspace = element.querySelector<HTMLDialogElement>(
      '.success-dialog:not(.receipt-dialog)',
    )!;
    const openReceipt = vi.fn();
    const openWorkspace = vi.fn();
    receipt.showModal = openReceipt;
    workspace.showModal = openWorkspace;
    element.querySelector<HTMLButtonElement>('.confirmation-actions .secondary-button')!.click();
    element.querySelector<HTMLButtonElement>('.confirmation-actions .primary-button')!.click();
    expect(openReceipt).toHaveBeenCalledOnce();
    expect(openWorkspace).toHaveBeenCalledOnce();
    expect(receipt.textContent).toContain('Nenhuma cobrança foi realizada.');
    expect(workspace.textContent).toContain('não está disponível nesta demonstração');
  });

  it('deve retirar os dados da tela e voltar ao pagamento quando o estado for limpo', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = approve();
    store.resetCheckout();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.confirmation-card')).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/pagamento', { replaceUrl: true });
  });
});
