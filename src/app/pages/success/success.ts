import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutStore } from '@state/stores/checkout.store';
import { Icon } from '../../components/icon/icon';
import { PaymentReceipt } from '../../components/payment-receipt/payment-receipt';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

@Component({
  selector: 'app-success-page',
  imports: [Icon, PaymentReceipt],
  templateUrl: './success.html',
  styleUrl: './success.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPage {
  readonly store = inject(CheckoutStore);
  readonly nextBillingDate = computed(() => {
    const payment = this.store.paymentSummary();
    return payment ? dateFormatter.format(new Date(payment.nextBillingAt)) : '';
  });
  readonly firstName = computed(() => {
    const name = this.store.paymentSummary()?.customerFirstName;
    return name
      ? name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1).toLocaleLowerCase('pt-BR')
      : '';
  });
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');
  private readonly router = inject(Router);

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
    effect(() => {
      if (!this.store.hasSuccessfulPayment()) {
        void this.router.navigateByUrl('/pagamento', { replaceUrl: true });
      }
    });
  }
}
