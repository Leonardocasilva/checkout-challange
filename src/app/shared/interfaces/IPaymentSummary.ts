import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IProduct } from './IProduct';

export interface IPaymentSummary {
  product: IProduct;
  method: PaymentMethod;
  amountInCents: number;
  orderId: string;
  paidAt: string;
  nextBillingAt: string;
  customerFirstName?: string;
  cardBrand?: 'Visa';
  cardLastFourDigits?: string;
}
