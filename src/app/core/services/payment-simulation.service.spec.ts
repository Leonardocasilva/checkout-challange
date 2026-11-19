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
});
