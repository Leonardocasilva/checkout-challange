import { IPaymentDetails } from './IPaymentDetails';

export interface IPaymentError {
  code: string;
  message: string;
  details?: IPaymentDetails;
}
