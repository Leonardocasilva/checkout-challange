import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IProduct } from './IProduct';

export interface IPaymentSummary {
  product: IProduct;
  method: PaymentMethod;
  amountInCents: number;
  cardLastFourDigits?: string;
}
