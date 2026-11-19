# Desafio de checkout

Aplicação Angular para o desafio de checkout. Esta primeira entrega contém a criação do projeto, uma página inicial simples e a configuração de desenvolvimento e testes.

## Tecnologias

- Angular e Angular CLI 22.3.0, com componentes standalone e TypeScript estrito.
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

## Decisões desta etapa

O projeto utiliza SCSS puro por familiaridade do desenvolvedor e capacidade de explicar as decisões de estilo. Essa escolha diverge do requisito de Tailwind CSS ou Bootstrap do desafio; nenhum desses frameworks foi instalado.

O roteador está habilitado, com a lista de rotas ainda vazia. A organização em `pages`, `components`, `core`, `state` e `shared`, o NgRx SignalStore com RxJS e os fluxos de pagamento pertencem às próximas entregas. Não há processamento de pagamento nesta etapa.

## Fluxo de trabalho

Cada etapa deve ter um commit e um pull request próprios, com título e descrição em português. A branch `inicializacao` parte da `main` e pode ser reutilizada após a integração de cada PR e a sincronização com a `main`.

- Implementação: `feat: descrição detalhada da implementação`.
- Correção: `hotfix: descrição detalhada da correção`.

A sequência começa pela criação do projeto, segue com a organização da estrutura e continua com as funcionalidades de pagamento, sucesso e erro.
