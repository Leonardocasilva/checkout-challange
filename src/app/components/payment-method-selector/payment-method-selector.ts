import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PAYMENT_METHOD_LABELS } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-payment-method-selector',
  imports: [Icon],
  templateUrl: './payment-method-selector.html',
  styleUrl: './payment-method-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelector {
  readonly selected = input<PaymentMethod | null>(null);
  readonly methodChange = output<PaymentMethod>();
  readonly labels = PAYMENT_METHOD_LABELS;
  readonly methods: { value: PaymentMethod; icon: IconName }[] = [
    { value: PaymentMethod.Credit, icon: 'card' },
    { value: PaymentMethod.Debit, icon: 'card' },
    { value: PaymentMethod.Pix, icon: 'pix' },
  ];
}
