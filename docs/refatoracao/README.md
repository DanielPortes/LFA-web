# Serie de Markdown para Refatoracao

Arquivos desta auditoria:

- `00-visao-geral.md`
- `01-layout-e-ux.md`
- `02-arquitetura-e-complexidade.md`
- `03-codigo-morto-e-limpeza.md`
- `04-performance-e-sem-regressao.md`

## Leitura recomendada

1. comecar por `00-visao-geral.md`
2. revisar `01-layout-e-ux.md`
3. definir fronteiras tecnicas com `02-arquitetura-e-complexidade.md`
4. limpar sobra com `03-codigo-morto-e-limpeza.md`
5. executar com guardrails de `04-performance-e-sem-regressao.md`

## Resumo executivo

As prioridades mais urgentes sao:

- corrigir CSS no-op e o uso de `@apply` em runtime
- reduzir sobrecarga visual do simulador
- retirar codigo morto e componentes duplicados
- separar shells de pagina de logica critica
- fazer code splitting antes de refatoracoes maiores
