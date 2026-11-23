import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { ICardData } from '@shared/interfaces/ICardData';
import { PricePipe } from '@shared/pipes/price.pipe';
import {
  cardCvvValidator,
  cardExpiryValidator,
  cardHolderValidator,
  cardNumberValidator,
  normalizeCardNumber,
} from '@shared/validators/card.validators';
import { CheckoutInfo } from '../checkout-info/checkout-info';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-card-payment-form',
  imports: [ReactiveFormsModule, PricePipe, Icon, CheckoutInfo],
  templateUrl: './card-payment-form.html',
  styleUrl: './card-payment-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPaymentForm {
  readonly method = input.required<PaymentMethod>();
  readonly amount = input.required<number>();
  readonly pay = output<ICardData>();
  readonly PaymentMethod = PaymentMethod;
  readonly form = new FormGroup({
    number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cardNumberValidator],
    }),
    holder: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cardHolderValidator],
    }),
    expiry: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cardExpiryValidator],
    }),
    cvv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cardCvvValidator],
    }),
  });

  error(field: keyof ICardData): string | null {
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return null;
    if (field === 'number') return 'Número inválido. Confira os 16 dígitos do cartão.';
    if (field === 'holder')
      return control.value.length > 80
        ? 'Use no máximo 80 caracteres.'
        : 'Informe o nome como aparece no cartão.';
    if (field === 'cvv') return 'Use 3 dígitos.';
    return control.hasError('expired') ? 'Cartão vencido.' : 'Use o formato MM/AA.';
  }

  maskInput(field: 'number' | 'expiry' | 'cvv', event: Event): void {
    const input = event.target as HTMLInputElement;
    const limit = field === 'number' ? 16 : field === 'expiry' ? 4 : 3;
    const position = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = Math.min(
      input.value.slice(0, position).replace(/\D/g, '').length,
      limit,
    );
    const digits = input.value.replace(/\D/g, '').slice(0, limit);
    let value = digits;
    let cursor = digitsBeforeCursor;

    if (field === 'number') {
      value = digits.match(/.{1,4}/g)?.join(' ') ?? '';
      cursor += Math.floor(Math.max(0, digitsBeforeCursor - 1) / 4);
    } else if (field === 'expiry' && digits.length >= 2) {
      value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      if (digitsBeforeCursor >= 2) cursor += 1;
    }

    this.form.controls[field].setValue(value, { emitEvent: false });
    input.value = value;
    input.setSelectionRange(Math.min(cursor, value.length), Math.min(cursor, value.length));
  }

  deleteAtSeparator(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursor = input.selectionStart;
    if (!event.cancelable || cursor === null || cursor !== input.selectionEnd) return;
    const inputType = (event as InputEvent).inputType;
    const backward =
      inputType === 'deleteContentBackward' && /[ /]/.test(input.value.charAt(cursor - 1));
    const forward = inputType === 'deleteContentForward' && /[ /]/.test(input.value.charAt(cursor));
    if (!backward && !forward) return;

    event.preventDefault();
    input.setRangeText(
      '',
      backward ? Math.max(0, cursor - 2) : cursor,
      backward ? cursor : cursor + 2,
      'start',
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.form.controls.expiry.updateValueAndValidity();
    if (this.form.invalid) return;
    const card = this.form.getRawValue();
    this.pay.emit({
      ...card,
      number: normalizeCardNumber(card.number),
      holder: card.holder.trim(),
    });
    this.form.reset();
  }
}
