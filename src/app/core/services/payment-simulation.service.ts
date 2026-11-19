import { Injectable } from '@angular/core';
import { Observable, defer, map, timer } from 'rxjs';
import { CHECKOUT_PRODUCT } from '@shared/constants/checkout';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IPaymentSummary } from '@shared/interfaces/IPaymentSummary';
import { PaymentRequest } from '@shared/types/PaymentRequest';
import { isValidCard, normalizeCardNumber } from '@shared/validators/card.validators';

@Injectable({ providedIn: 'root' })
export class PaymentSimulationService {
  process(request: PaymentRequest): Observable<IPaymentSummary> {
    return defer(() => {
      if (request.method !== PaymentMethod.Pix && !isValidCard(request.card)) {
        throw {
          code: 'INVALID_CARD',
          message: 'Confira os dados do cartão antes de tentar novamente.',
        };
      }

      const number =
        request.method === PaymentMethod.Pix ? null : normalizeCardNumber(request.card.number);
      const declined = number === '4000000000000002';
      const payment = {
        product: CHECKOUT_PRODUCT,
        method: request.method,
        amountInCents: CHECKOUT_PRODUCT.priceInCents,
        ...(number ? { cardLastFourDigits: number.slice(-4) } : {}),
        ...(number?.startsWith('4') ? { cardBrand: 'Visa' as const } : {}),
        ...(request.method !== PaymentMethod.Pix
          ? { customerFirstName: request.card.holder.trim().split(/\s+/)[0] }
          : {}),
      };

      return timer(1600).pipe(
        map(() => {
          if (declined) {
            throw {
              code: 'PAYMENT_DECLINED',
              message: 'Cartão não autorizado. Tente novamente com outro cartão ou escolha Pix.',
            };
          }
          const paidAt = new Date();
          const nextBillingAt = new Date(paidAt);
          nextBillingAt.setMonth(nextBillingAt.getMonth() + 1, 1);
          const lastDay = new Date(
            nextBillingAt.getFullYear(),
            nextBillingAt.getMonth() + 1,
            0,
          ).getDate();
          nextBillingAt.setDate(Math.min(paidAt.getDate(), lastDay));

          return {
            ...payment,
            orderId: `NX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            paidAt: paidAt.toISOString(),
            nextBillingAt: nextBillingAt.toISOString(),
          };
        }),
      );
    });
  }
}
