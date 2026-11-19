import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { ICardData } from '@shared/interfaces/ICardData';

export type PaymentRequest =
  | { method: PaymentMethod.Credit | PaymentMethod.Debit; card: ICardData }
  | { method: PaymentMethod.Pix };
