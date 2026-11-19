import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { PaymentStatus } from '@shared/enums/PaymentStatus';
import { IPaymentError } from './IPaymentError';
import { IPaymentSummary } from './IPaymentSummary';

export interface ICheckoutState {
  selectedMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paymentSummary: IPaymentSummary | null;
  paymentError: IPaymentError | null;
}
