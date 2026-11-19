import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-success-page',
  templateUrl: './success.html',
  styleUrl: './success.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPage {}
