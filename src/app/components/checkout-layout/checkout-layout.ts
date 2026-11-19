import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-checkout-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './checkout-layout.html',
  styleUrl: './checkout-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayout {}
