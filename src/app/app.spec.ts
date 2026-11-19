import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('Aplicação', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('deve iniciar a aplicação com o layout e a página de pagamento', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('header')?.textContent).toContain('Checkout');
    expect(element.querySelector('main h1')?.textContent).toBe('Finalize sua assinatura');
    expect(element.querySelector('footer')?.textContent).toContain('© 2026 Nexo.');
  });
});
