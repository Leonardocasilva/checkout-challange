import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PAYMENT_METHOD_LABELS } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { ICardData } from '@shared/interfaces/ICardData';
import { PricePipe } from '@shared/pipes/price.pipe';
import { CheckoutStore } from '@state/stores/checkout.store';
import { CardPaymentForm } from '../../components/card-payment-form/card-payment-form';
import { Icon } from '../../components/icon/icon';
import { PaymentMethodSelector } from '../../components/payment-method-selector/payment-method-selector';
import { PixPayment } from '../../components/pix-payment/pix-payment';
import { ProductSummary } from '../../components/product-summary/product-summary';

@Component({
  selector: 'app-payment-page',
  imports: [CardPaymentForm, Icon, PaymentMethodSelector, PixPayment, ProductSummary, PricePipe],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage {
  readonly store = inject(CheckoutStore);
  readonly PaymentMethod = PaymentMethod;
  readonly methodLabels = PAYMENT_METHOD_LABELS;
  private readonly router = inject(Router);

  constructor() {
    const method = this.store.selectedMethod() ?? PaymentMethod.Credit;
    this.store.resetCheckout();
    this.store.selectPaymentMethod(method);

    effect(() => {
      if (this.store.hasSuccessfulPayment()) void this.router.navigateByUrl('/sucesso');
      if (this.store.hasFailedPayment()) void this.router.navigateByUrl('/erro');
    });
    inject(DestroyRef).onDestroy(() => this.store.cancelPayment());
  }

  payWithCard(card: ICardData): void {
    const method = this.store.selectedMethod();
    if (method === PaymentMethod.Credit || method === PaymentMethod.Debit) {
      this.store.processPayment({ method, card });
    }
  }

  payWithPix(): void {
    this.store.processPayment({ method: PaymentMethod.Pix });
  }
}
