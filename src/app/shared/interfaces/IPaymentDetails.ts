import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IProduct } from './IProduct';

export interface IPaymentDetails {
  product: IProduct;
  method: PaymentMethod;
  amountInCents: number;
  orderId?: string;
  cardBrand?: 'Visa';
  cardLastFourDigits?: string;
}
