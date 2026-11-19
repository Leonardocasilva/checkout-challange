import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckoutStore } from '@state/stores/checkout.store';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  templateUrl: './error.html',
  styleUrl: './error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  protected readonly checkoutStore = inject(CheckoutStore);
}
