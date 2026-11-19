import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage {}
