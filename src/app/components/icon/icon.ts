import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  'brand' | 'product' | 'card' | 'pix' | 'lock' | 'shield' | 'check' | 'copy' | 'info' | 'arrow';

@Component({
  selector: 'app-icon',
  template:
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use [attr.href]="\'/icons.svg#\' + name()" /></svg>',
  styles:
    ':host { display: inline-flex; flex: 0 0 auto; width: 1.25em; height: 1.25em; vertical-align: middle; svg { width: 100%; height: 100%; } }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
}
