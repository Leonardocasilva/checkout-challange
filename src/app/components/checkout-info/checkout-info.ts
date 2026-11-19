import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-checkout-info',
  templateUrl: './checkout-info.html',
  styleUrl: './checkout-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutInfo {
  readonly topic = input.required<'help' | 'privacy' | 'terms'>();
  readonly content = {
    help: {
      label: 'Precisa de ajuda?',
      title: 'Como testar o checkout',
      text: 'Use apenas dados fictícios. Preencha os dados do cartão ou escolha Pix e conclua o pagamento. Esta demonstração não realiza cobranças.',
    },
    privacy: {
      label: 'Privacidade',
      title: 'Privacidade nesta demonstração',
      text: 'Os dados do formulário ficam apenas na memória durante a simulação. Não são enviados a um serviço de pagamento nem gravados no navegador. Use apenas dados fictícios.',
    },
    terms: {
      label: 'Termos de uso',
      title: 'Termos da demonstração',
      text: 'O Nexo Pro é um produto fictício neste checkout. Não há cobrança, contratação, renovação ou acesso a um serviço real.',
    },
  };
}
