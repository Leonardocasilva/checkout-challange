import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { SIMULATED_PIX_CODE } from '@shared/constants/checkout';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-pix-payment',
  imports: [Icon],
  templateUrl: './pix-payment.html',
  styleUrl: './pix-payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixPayment {
  readonly pay = output<void>();
  readonly code = SIMULATED_PIX_CODE;
  readonly copyStatus = signal<'idle' | 'copied' | 'error'>('idle');

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code);
      this.copyStatus.set('copied');
    } catch {
      this.copyStatus.set('error');
    }
  }
}
