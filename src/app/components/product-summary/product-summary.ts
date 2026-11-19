import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IProduct } from '@shared/interfaces/IProduct';
import { PricePipe } from '@shared/pipes/price.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-product-summary',
  imports: [Icon, PricePipe],
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSummary {
  readonly product = input.required<IProduct>();
}
