# Desafio de checkout

Aplicação Angular para o desafio de checkout.

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
