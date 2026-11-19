import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { IProduct } from '@shared/interfaces/IProduct';

export const CHECKOUT_PRODUCT: IProduct = {
  id: 'nexo-pro',
  name: 'Nexo Pro',
  description: 'Plano mensal · 1 usuário',
  priceInCents: 7990,
  features: ['Projetos e tarefas ilimitados', 'Relatórios e automações', 'Suporte prioritário'],
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Credit]: 'Crédito',
  [PaymentMethod.Debit]: 'Débito',
  [PaymentMethod.Pix]: 'Pix',
};

export const SIMULATED_PIX_CODE = '000201_NEXO-PRO_7990_DEMO';
