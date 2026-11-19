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
    if (field === 'number') return 'Número inválido. Confira os dígitos do cartão.';
    if (field === 'holder') return 'Informe o nome como aparece no cartão.';
    if (field === 'cvv') return 'Use 3 ou 4 dígitos.';
    return control.hasError('expired') ? 'Cartão vencido.' : 'Use o formato MM/AA.';
  }

  formatNumber(): void {
    const value = normalizeCardNumber(this.form.controls.number.value);
    if (/^\d+$/.test(value))
      this.form.controls.number.setValue(value.replace(/(.{4})(?=.)/g, '$1 '));
  }

  formatExpiry(): void {
    const value = this.form.controls.expiry.value;
    if (/^\d{4}$/.test(value))
      this.form.controls.expiry.setValue(`${value.slice(0, 2)}/${value.slice(2)}`);
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
