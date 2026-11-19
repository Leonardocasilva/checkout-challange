import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { PricePipe } from '@shared/pipes/price.pipe';
import { Icon } from '../icon/icon';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

@Component({
  selector: 'app-payment-receipt',
  imports: [Icon, PricePipe],
  templateUrl: './payment-receipt.html',
  styleUrl: './payment-receipt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentReceipt {
  readonly payment = input.required<IPaymentSummary>();
  readonly methodDescription = input.required<string>();
  readonly paidAt = computed(() => dateTimeFormatter.format(new Date(this.payment().paidAt)));
}
