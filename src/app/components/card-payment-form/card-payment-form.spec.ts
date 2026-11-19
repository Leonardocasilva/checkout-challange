import { TestBed } from '@angular/core/testing';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { CardPaymentForm } from './card-payment-form';

const card = {
  number: '4242 4242 4242 4242',
  holder: ' Marina Almeida ',
  expiry: '12/35',
  cvv: '123',
};

describe('Formulário do cartão', () => {
  beforeEach(() => vi.setSystemTime(new Date(2030, 10, 19)));
  afterEach(() => vi.useRealTimers());
  function setup(method = PaymentMethod.Credit) {
    const fixture = TestBed.createComponent(CardPaymentForm);
    fixture.componentRef.setInput('method', method);
    fixture.componentRef.setInput('amount', 7990);
    fixture.detectChanges();
    return fixture;
  }
  it('deve impedir envio inválido e associar as mensagens aos campos', () => {
    const fixture = setup();
    const pay = vi.fn();
    fixture.componentInstance.pay.subscribe(pay);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(pay).not.toHaveBeenCalled();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    expect(element.querySelector('#card-number')?.getAttribute('aria-describedby')).toBe(
      'number-error',
    );
    expect(element.querySelector('#number-error')?.textContent).toContain('Número inválido');
  });
  it.each([PaymentMethod.Credit, PaymentMethod.Debit])(
    'deve enviar dados válidos de %s e limpar os campos',
    (method) => {
      const fixture = setup(method);
      const pay = vi.fn();
      fixture.componentInstance.pay.subscribe(pay);
      fixture.componentInstance.form.setValue(card);
      fixture.componentInstance.submit();
      expect(pay).toHaveBeenCalledExactlyOnceWith({
        ...card,
        number: '4242424242424242',
        holder: 'Marina Almeida',
      });
      expect(fixture.componentInstance.form.getRawValue()).toEqual({
        number: '',
        holder: '',
        expiry: '',
        cvv: '',
      });
    },
  );
  it('deve formatar número e validade sem ocultar entradas inválidas', () => {
    const form = setup().componentInstance;
    form.form.controls.number.setValue('4242424242424242');
    form.form.controls.expiry.setValue('1235');
    form.formatNumber();
    form.formatExpiry();
    expect(form.form.controls.number.value).toBe('4242 4242 4242 4242');
    expect(form.form.controls.expiry.value).toBe('12/35');
    form.form.controls.number.setValue('4242abc');
    form.formatNumber();
    expect(form.form.controls.number.invalid).toBe(true);
  });
});
