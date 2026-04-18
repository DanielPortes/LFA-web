# Layout e UX

## Diagnostico

O site ja tem uma direcao visual moderna, mas perde clareza por excesso de camadas flutuantes e por inconsistencias entre o que o JSX declara e o que o CSS realmente entrega.

## Problemas principais

### 1. Simulador com sobrecarga de paines e comandos

Em `src/pages/Simulator.tsx`, o usuario encontra ao mesmo tempo:

- seletor de modo
- status do automato
- importacao de regex
- warnings
- fita ou pilha
- controles de simulacao
- historico detalhado
- a propria area de edicao

Isso produz uma experiencia poderosa, mas com densidade alta demais para a tarefa principal. O fluxo basico deveria ser:

1. montar
2. informar entrada
3. executar
4. inspecionar resultado

Hoje a tela entrega ferramentas avancadas no mesmo nivel visual do fluxo basico.

### 2. Overlay sobre overlay

O simulador usa varias regioes absolutas:

- topo com `modeSelector` e `statsPanel`
- lateral direita opcional
- dock inferior
- minimap flutuante no editor
- toolbar lateral do editor

Resultado:

- competicao por espaco util
- colisao visual em telas intermediarias
- mais pontos de manutencao de espaçamento hardcoded

### 3. Scroll aninhado e navegacao inconsistente

`Content` e `Exercises` usam containers internos com `overflow-y-auto`, enquanto outras areas usam scroll da pagina.

Efeitos praticos:

- restauracao de scroll mais dificil
- maior custo de acessibilidade
- comportamento desigual entre abas

### 4. Navbar superior + FABs + sidebars fixas

O produto ja tem uma `TopNav` fixa. Em `Content` e `Exercises`, somam-se:

- botao flutuante para abrir sidebar no mobile
- sidebar fixa/overlay
- modais grandes

O resultado e um excesso de pontos de entrada competindo pela mesma atencao.

### 5. Dados da Home envelhecem mal

Em `src/pages/Home.tsx`, a timeline mostra datas fixas:

- `24/11/2025`
- `12/01/2026`
- `21/01/2026`
- `19/01/2026`

Em `2026-04-14`, a pagina ainda marca `Prova 2` de `12/01/2026` como `active` e itens de janeiro de 2026 como `next`. Isso reduz confianca no restante do site.

### 6. Refinamento visual declarado, mas nao aplicado

Ha classes visuais usadas em JSX que nao existem no CSS final, por exemplo:

- `bg-surface-1/80`
- `bg-surface-1/90`
- `bg-status-warning-soft/50`
- `border-default/50`
- `shadow-apple-2xl`

Isso cria discrepancia entre a intencao do layout e o render final.

### 7. `@apply` dentro de `<style>` em runtime

`src/features/simulator/panels/GrammarWorkspace.tsx` injeta:

```css
.btn-transform {
    @apply ...
}
```

Dentro de um `<style>` de componente, isso nao passa pelo pipeline do Tailwind. O navegador ignora esse uso, entao os botoes de transformacao ficam sem a estilizacao pretendida.

## Recomendacoes

### Manter moderno, mas com menos ruido

- preservar o visual glass, o fundo ambiente e a sensacao de fluidez
- reduzir o numero de blocos sempre visiveis no simulador
- adotar hierarquia clara entre acao principal, acao secundaria e diagnostico

### Novo principio para o simulador

- primario: editor + entrada + executar
- secundario: historico, fita/pilha, analise
- avancado: import/export, conversoes, layout automatico, biblioteca

Ferramentas avancadas devem ir para um drawer, aba secundaria ou menu contextual, nao para o primeiro plano.

### Novo principio para `Content` e `Exercises`

- sidebar deve ser navegacao, nao painel de controle
- evitar botao flutuante quando a mesma acao pode morar no cabecalho da pagina
- manter um unico plano de rolagem por pagina sempre que possivel

### Correcoes visuais de base

- substituir classes no-op por tokens reais ou CSS explicito
- mover `.btn-transform` para `src/index.css` ou para um componente com classes utilitarias validas
- reduzir espacamentos absolutos hardcoded em paines do simulador

## Resultado esperado

Depois da refatoracao visual, o usuario deve ver menos comandos concorrentes, mas sem perder poder. A interface continua moderna e fluida, porem com menos ruido operacional e com comportamento visual mais previsivel.

## Checklist de implementacao

- `[x]` As classes visuais no-op citadas na auditoria passaram a ter tokens reais em `src/index.css`.
- `[x]` `.btn-transform` saiu do `<style>` runtime e foi consolidado no CSS global.
- `[x]` A Home deixou de depender de datas fixas vencidas e passou a usar uma trilha de estudo perene.
- `[x]` Os FABs de `Content` e `Exercises` foram removidos; a abertura do sumario foi movida para o cabecalho da propria pagina.
- `[x]` O simulador ficou menos ruidoso com `RegexImportCard` secundario, `SimulationDock`, `SimulationInspectorPanel` e `GrammarWorkspaceShell`; historico, fita e alertas agora compartilham um unico inspetor.
- `[x]` `Content` e `Exercises` passaram a usar sidebars de navegacao e deixaram o conteudo principal seguir a rolagem natural da pagina.
- `[x]` O objetivo de manter um unico plano de rolagem por pagina foi concluido nas paginas principais; o scroll interno ficou restrito aos overlays mobile e paineis realmente auxiliares.
- `[x]` O editor e o simulador deixaram de depender de sobreposicoes absolutas para as regioes principais com `EditorShell` e `AutomatonWorkspace` em grid.

Status final: `feito`
