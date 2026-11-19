import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CheckoutStore } from '@state/stores/checkout.store';
import { CheckoutInfo } from '../checkout-info/checkout-info';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-checkout-layout',
  imports: [RouterLink, RouterOutlet, CheckoutInfo, Icon],
  templateUrl: './checkout-layout.html',
  styleUrl: './checkout-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayout {
  readonly store = inject(CheckoutStore);
}
