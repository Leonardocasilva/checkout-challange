# Regras do projeto

- Trabalhar por etapas, com um commit e um pull request para cada entrega.
- Partir da `main` para criar a branch de trabalho. A branch `inicializacao` pode ser reutilizada após a integração do PR anterior e a sincronização com a `main`.
- Usar `feat: descrição detalhada da implementação` para implementações e `hotfix: descrição detalhada da correção` para correções.
- Escrever títulos e descrições de commits e pull requests, documentação e comentários de código em português.
- Não inserir referências a ferramentas de geração, assistentes ou autoria automatizada em nomes de branches, mensagens de commit ou comentários de código.
- Não adicionar trailers de coautoria automaticamente.
- Não usar travessão, identificado pelo código Unicode U+2014, em código, comentários, documentação ou mensagens.
- Usar SCSS puro, classes em `kebab-case` e seletores aninhados, com pouca profundidade. Usar `&` para estados e modificadores e manter as media queries no bloco correspondente.
- Seguir a organização do Time Tree: `pages`, `components`, `core`, `state/stores` e `shared`, conforme cada etapa exigir.
- Usar NgRx SignalStore com RxJS para o estado compartilhado e a coordenação das operações assíncronas.
- Validar a compilação e os testes pertinentes antes de publicar cada etapa.
