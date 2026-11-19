import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IPaymentDetails } from '@shared/interfaces/IPaymentDetails';
import { PricePipe } from '@shared/pipes/price.pipe';
import { Icon } from '../icon/icon';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

@Component({
  selector: 'app-payment-details',
  imports: [Icon, PricePipe],
  templateUrl: './payment-details.html',
  styleUrl: './payment-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetails {
  readonly payment = input.required<IPaymentDetails>();
  readonly methodDescription = input.required<string>();
  readonly approved = input(true);
  readonly paidAt = input<string | null>(null);
  readonly paidAtLabel = computed(() => {
    const paidAt = this.paidAt();
    return paidAt ? dateTimeFormatter.format(new Date(paidAt)) : null;
  });
}
