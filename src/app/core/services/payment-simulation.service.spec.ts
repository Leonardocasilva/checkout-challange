import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PaymentMethod } from '@shared/enums/PaymentMethod';
import { PaymentSimulationService } from './payment-simulation.service';

const card = { number: '4242424242424242', holder: 'Marina Almeida', expiry: '12/35', cvv: '123' };

describe('Simulação do pagamento', () => {
  let service: PaymentSimulationService;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 10, 19));
    service = TestBed.inject(PaymentSimulationService);
  });
  afterEach(() => vi.useRealTimers());

  it.each([PaymentMethod.Credit, PaymentMethod.Debit])(
    'deve aprovar %s após o processamento e devolver apenas os últimos dígitos',
    async (method) => {
      const next = vi.fn();
      service.process({ method, card }).subscribe(next);
      vi.advanceTimersByTime(1599);
      expect(next).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(next).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ method, amountInCents: 7990, cardLastFourDigits: '4242' }),
      );
      expect(JSON.stringify(next.mock.calls[0])).not.toContain(card.number);
      expect(JSON.stringify(next.mock.calls[0])).not.toContain('cvv');
    },
  );
  it('deve simular a recusa do cartão de teste', async () => {
    const result = firstValueFrom(
      service.process({
        method: PaymentMethod.Credit,
        card: { ...card, number: '4000000000000002' },
      }),
    );
    const assertion = expect(result).rejects.toMatchObject({ code: 'PAYMENT_DECLINED' });
    vi.advanceTimersByTime(1600);
    await assertion;
  });
  it('deve rejeitar dados inválidos mesmo quando chamados diretamente', async () => {
    await expect(
      firstValueFrom(service.process({ method: PaymentMethod.Debit, card: { ...card, cvv: '1' } })),
    ).rejects.toMatchObject({ code: 'INVALID_CARD' });
  });
  it('deve aprovar Pix sem solicitar dados do cartão', async () => {
    const result = firstValueFrom(service.process({ method: PaymentMethod.Pix }));
    vi.advanceTimersByTime(1600);
    expect(await result).toEqual(
      expect.objectContaining({ method: PaymentMethod.Pix, amountInCents: 7990 }),
    );
    expect(await result).not.toHaveProperty('cardLastFourDigits');
  });

  it('deve registrar o pedido e a data somente ao concluir a aprovação', async () => {
    const result = firstValueFrom(service.process({ method: PaymentMethod.Credit, card }));
    vi.advanceTimersByTime(1600);
    const payment = await result;
    expect(payment.orderId).toMatch(/^NX-[A-F0-9]{8}$/);
    expect(payment.paidAt).toBe(new Date(2030, 10, 19, 0, 0, 1, 600).toISOString());
    expect(payment.nextBillingAt).toBe(new Date(2030, 11, 19, 0, 0, 1, 600).toISOString());
    expect(payment.customerFirstName).toBe('Marina');
    expect(payment.cardBrand).toBe('Visa');
    expect(JSON.stringify(payment)).not.toContain(card.holder);
  });

  it.each([
    { year: 2030, month: 0, day: 31, nextYear: 2030, nextMonth: 1, nextDay: 28 },
    { year: 2032, month: 0, day: 31, nextYear: 2032, nextMonth: 1, nextDay: 29 },
    { year: 2030, month: 11, day: 31, nextYear: 2031, nextMonth: 0, nextDay: 31 },
  ])(
    'deve ajustar a renovação mensal para $nextDay no mês seguinte a $day/$month/$year',
    async ({ year, month, day, nextYear, nextMonth, nextDay }) => {
      vi.setSystemTime(new Date(year, month, day, 12));
      const result = firstValueFrom(service.process({ method: PaymentMethod.Pix }));
      vi.advanceTimersByTime(1600);
      const payment = await result;
      expect(payment.nextBillingAt).toBe(
        new Date(nextYear, nextMonth, nextDay, 12, 0, 1, 600).toISOString(),
      );
      expect(payment.customerFirstName).toBeUndefined();
      expect(payment.cardBrand).toBeUndefined();
    },
  );
});
