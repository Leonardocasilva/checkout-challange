# Desafio de checkout

Aplicação Angular para o desafio de checkout.

## Tecnologias

- Angular e Angular CLI 22.3.0, com componentes standalone e TypeScript estrito.
- NgRx SignalStore 22.0.1 para o estado compartilhado e RxJS 7.8.
- SCSS puro, com seletores aninhados e classes em `kebab-case`.
- Vitest para os testes unitários, integrado ao Angular CLI.
- npm com `package-lock.json` versionado para reproduzir as dependências.

## Requisitos

- Node.js 24.18.0, indicado no arquivo `.nvmrc`.
- npm 11.16.0.

Com o nvm instalado, execute `nvm install` e `nvm use` na raiz do repositório.

## Instalação e execução

```bash
npm ci
npm start
```

Acesse [a aplicação local](http://localhost:4200/). O servidor atualiza a página automaticamente ao salvar os arquivos.

## Verificação

```bash
npm run build
npm test -- --watch=false
```

A compilação de produção é gerada em `dist/checkout-challange/browser`. Para desenvolver com testes em modo contínuo, execute `npm test`.

Para verificar a simulação em `/pagamento`, use apenas dados fictícios:

| Cenário                    | Dados                                                                            | Resultado                                                               |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Crédito ou débito aprovado | Número `4242 4242 4242 4242`, nome `Marina Almeida`, validade futura e CVV `123` | Processamento e redirecionamento para `/sucesso`                        |
| Cartão recusado            | Número `4000 0000 0000 0002`, nome, validade futura e CVV válidos                | Redirecionamento para `/erro`, com motivo da recusa e opções de retorno |
| Pix                        | Escolha Pix, copie o código se desejar e clique em concluir                      | Processamento e redirecionamento para `/sucesso`                        |
| Dados inválidos            | Número incorreto, nome vazio, validade vencida ou CVV incompleto                 | Mensagens nos campos e envio bloqueado                                  |

O código e o QR Code de Pix são demonstrativos e não realizam pagamentos. A simulação leva aproximadamente 1,6 segundo. Recarregar `/sucesso` ou `/erro` descarta o estado em memória e retorna ao pagamento.

O formulário aceita cartões de 16 dígitos, agrupados automaticamente com espaços durante a digitação. O nome tem limite de 80 caracteres, a validade recebe a máscara `MM/AA` e o CVV aceita somente 3 dígitos. Confira também a colagem de valores e a edição no meio dos campos.

Após uma recusa, confira em `/erro` o motivo, o pedido, o meio utilizado com o cartão mascarado e o total a pagar. **Tentar novamente** retorna ao formulário com o mesmo meio selecionado e os campos vazios. **Escolher outro meio** retorna à seleção sem uma opção marcada, permitindo escolher outro cartão ou Pix. O link de ajuda abre as orientações da demonstração.

Após uma aprovação, confira em `/sucesso` o produto, o meio utilizado, o pedido, a data e o total pago. Em pagamentos com cartão, somente os últimos quatro dígitos aparecem. A próxima renovação usa o mesmo dia do mês seguinte, limitado ao último dia disponível naquele mês.

Use **Ver recibo** para consultar os mesmos dados em um diálogo. **Acessar meu espaço** abre o aviso do ambiente demonstrativo. Os diálogos podem ser fechados pelo botão ou pela tecla `Esc`. Não há envio de e-mail nem acesso a uma conta real.
