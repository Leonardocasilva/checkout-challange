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
  function inputValue(
    fixture: ReturnType<typeof setup>,
    id: string,
    value: string,
    cursor = value.length,
  ) {
    const input = fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
    input.value = value;
    input.setSelectionRange(cursor, cursor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    return input;
  }

  it('deve agrupar o cartão durante a digitação e manter o formulário sincronizado', () => {
    const fixture = setup();
    const input = inputValue(fixture, 'card-number', '4242');
    expect(input.value).toBe('4242');
    inputValue(fixture, 'card-number', input.value + '4');
    expect(input.value).toBe('4242 4');
    expect(input.selectionStart).toBe(6);
    expect(fixture.componentInstance.form.controls.number.value).toBe(input.value);
    expect(fixture.componentInstance.form.controls.number.dirty).toBe(true);
  });

  it('deve filtrar caracteres e limitar cartão e CVV mesmo em uma entrada colada', () => {
    const fixture = setup();
    expect(inputValue(fixture, 'card-number', '4242-4242 4242a4242999').value).toBe(
      '4242 4242 4242 4242',
    );
    expect(inputValue(fixture, 'card-cvv', 'a12345').value).toBe('123');
    expect(fixture.componentInstance.form.controls.cvv.value).toBe('123');
  });

  it('deve inserir a barra após o mês e limitar a validade a MM/AA', () => {
    const fixture = setup();
    const input = inputValue(fixture, 'card-expiry', '1');
    expect(input.value).toBe('1');
    inputValue(fixture, 'card-expiry', '12');
    expect(input.value).toBe('12/');
    expect(input.selectionStart).toBe(3);
    expect(inputValue(fixture, 'card-expiry', '12/3').value).toBe('12/3');
    expect(inputValue(fixture, 'card-expiry', '123599').value).toBe('12/35');
    expect(fixture.componentInstance.form.controls.expiry.value).toBe('12/35');
  });

  it('deve preservar o cursor ao editar um dígito no meio do cartão', () => {
    const fixture = setup();
    const input = inputValue(fixture, 'card-number', '4242 9242 4242 4242', 6);
    expect(input.value).toBe('4242 9242 4242 4242');
    expect(input.selectionStart).toBe(6);
  });

  it.each([
    {
      id: 'card-number',
      value: '1234 5678',
      cursor: 5,
      inputType: 'deleteContentBackward',
      expected: '1235 678',
      position: 3,
    },
    {
      id: 'card-number',
      value: '1234 5678',
      cursor: 4,
      inputType: 'deleteContentForward',
      expected: '1234 678',
      position: 4,
    },
    {
      id: 'card-expiry',
      value: '12/',
      cursor: 3,
      inputType: 'deleteContentBackward',
      expected: '1',
      position: 1,
    },
    {
      id: 'card-expiry',
      value: '12/35',
      cursor: 2,
      inputType: 'deleteContentForward',
      expected: '12/5',
      position: 3,
    },
  ])(
    'deve permitir $inputType junto ao separador de $id',
    ({ id, value, cursor, inputType, expected, position }) => {
      const fixture = setup();
      const input = inputValue(fixture, id, value);
      input.setSelectionRange(cursor, cursor);
      input.dispatchEvent(
        new InputEvent('beforeinput', { inputType, bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
      expect(input.value).toBe(expected);
      expect(input.selectionStart).toBe(position);
    },
  );

  it.each([
    { number: '4000000000000000006' },
    { holder: 'A'.repeat(81) },
    { cvv: '1234' },
    { expiry: '12/2035' },
  ])(
    'deve rejeitar valores fora dos limites atribuídos diretamente ao formulário: %j',
    (invalid) => {
      const fixture = setup();
      const pay = vi.fn();
      fixture.componentInstance.pay.subscribe(pay);
      fixture.componentInstance.form.setValue({ ...card, ...invalid });
      fixture.componentInstance.submit();
      expect(pay).not.toHaveBeenCalled();
      expect(fixture.componentInstance.form.invalid).toBe(true);
    },
  );
});
