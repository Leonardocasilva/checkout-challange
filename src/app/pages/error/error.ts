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
import { Router, RouterLink } from '@angular/router';
import { CheckoutStore } from '@state/stores/checkout.store';
import { CheckoutInfo } from '../../components/checkout-info/checkout-info';
import { Icon } from '../../components/icon/icon';
import { PaymentDetails } from '../../components/payment-details/payment-details';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, CheckoutInfo, Icon, PaymentDetails],
  templateUrl: './error.html',
  styleUrl: './error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  readonly store = inject(CheckoutStore);
  readonly reasonTitle = computed(() => {
    switch (this.store.paymentError()?.code) {
      case 'PAYMENT_DECLINED':
        return 'Cartão não autorizado';
      case 'INVALID_CARD':
        return 'Confira os dados do cartão';
      default:
        return 'Falha no processamento';
    }
  });
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');
  private readonly router = inject(Router);

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
    effect(() => {
      if (!this.store.hasFailedPayment()) {
        void this.router.navigateByUrl('/pagamento', { replaceUrl: true });
      }
    });
  }
}
