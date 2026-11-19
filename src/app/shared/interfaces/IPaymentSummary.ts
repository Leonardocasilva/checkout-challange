import { IPaymentDetails } from './IPaymentDetails';

export interface IPaymentSummary extends IPaymentDetails {
  orderId: string;
  paidAt: string;
  nextBillingAt: string;
  customerFirstName?: string;
}
