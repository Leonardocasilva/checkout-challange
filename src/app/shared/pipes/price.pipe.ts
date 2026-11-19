import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(cents: number): string {
    return formatter.format(cents / 100);
  }
}
