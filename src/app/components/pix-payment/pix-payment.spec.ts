import { TestBed } from '@angular/core/testing';
import { SIMULATED_PIX_CODE } from '@shared/constants/checkout';
import { PixPayment } from './pix-payment';

describe('Pagamento com Pix', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('deve copiar o código simulado e confirmar a cópia', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const component = TestBed.createComponent(PixPayment).componentInstance;
    await component.copyCode();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(SIMULATED_PIX_CODE);
    expect(component.copyStatus()).toBe('copied');
  });
  it('deve permitir cópia manual quando a área de transferência não está disponível', async () => {
    vi.stubGlobal('navigator', {});
    const fixture = TestBed.createComponent(PixPayment);
    await fixture.componentInstance.copyCode();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('copie manualmente');
    expect(fixture.nativeElement.querySelector('input').value).toBe(SIMULATED_PIX_CODE);
  });
});
