# Auditoria de Refatoracao

Data da auditoria: `2026-04-14`

## Escopo

Esta auditoria cobre:

- layout e design da interface
- excesso de comandos e botoes no fluxo principal
- codigo morto ou duplicado
- hotspots de complexidade
- performance de carregamento e renderizacao
- guardrails para evitar regressao no motor do simulador e na area de trabalho

## Baseline validado

Antes de propor refatoracao, o projeto foi validado com:

- `npm run lint`
- `npm run test`
- `npm run build`

Resultado atual:

- lint: passou
- testes: `137` testes passando
- build: passou
- bundle de producao:
  - CSS principal: `114.37 kB`
  - JS principal da app: `378.29 kB` (`104.24 kB` gzip)
  - vendor React: `209.94 kB` (`66.35 kB` gzip)

## Hotspots de complexidade

Arquivos com maior concentracao de responsabilidade:

| Arquivo | Linhas | Leitura |
| --- | ---: | --- |
| `src/components/automaton/AutomatonCanvas.tsx` | 1247 | canvas, selecao, drag, atalhos, menu de contexto, zoom, hint |
| `src/pages/Exercises.tsx` | 1166 | listagem, busca, modal, verificador, converter, feedback |
| `src/components/automaton/AutomatonEditor.tsx` | 1094 | shell do editor, import/export, modais, historico, propriedades, analise |
| `src/pages/Simulator.tsx` | 720 | layout, controles, regex, historico, fita, modos |
| `src/pages/Content.tsx` | 591 | sidebar, progresso, renderer, modal de preview |
| `src/hooks/useAutomatonSimulation.ts` | 514 | simulacao de AFD/AFN/AP/MT/ALL/Moore/Mealy |

## Riscos prioritarios

### P0

- `src/features/simulator/panels/GrammarWorkspace.tsx` usa `@apply` dentro de `<style>{...}</style>`. Isso nao e processado pelo Tailwind em runtime.
- Ha pelo menos `50` ocorrencias de classes como `bg-surface-1/80`, `border-default/50` e `shadow-apple-2xl` que nao aparecem no CSS gerado. Parte do refinamento visual hoje e no-op.

### P1

- O simulador mistura shell, dock, warnings, regex import, historico e fita na mesma pagina.
- `AutomatonEditor` e `AutomatonCanvas` concentram UI, atalhos, estado, I/O e renderizacao em arquivos gigantes.
- Existem componentes exportados e nao usados, sinal de refatoracao interrompida.

### P2

- Todas as areas pesadas da app entram no bundle inicial mesmo quando o usuario abre apenas uma aba.
- Conteudo da Home tem datas fixas e ja desatualizadas em `2026-04-14`.

## O que preservar

Nao mexer primeiro em:

- `src/simulation/**`
- `src/utils/conversions/**`
- `src/utils/automatonLogic.ts`
- `src/utils/pda.ts`
- `src/utils/turingLogic.ts`
- `src/utils/exerciseSimulation.ts`

Essas areas concentram a logica que ja esta coberta por testes e nao devem ser reestruturadas junto com a limpeza visual.

## Ordem recomendada

1. Corrigir CSS no-op e remover codigo morto comprovado.
2. Extrair cascas de layout sem alterar a logica dos hooks.
3. Separar o shell do simulador e do editor em componentes menores.
4. Lazy load de paginas e ferramentas pesadas.
5. So depois revisitar refinamentos visuais mais profundos.

## Checklist de implementacao

- `[x]` Corrigir CSS no-op e remover `@apply` em runtime foi concluido em `src/index.css` e `src/features/simulator/panels/GrammarWorkspace.tsx`.
- `[x]` Code splitting de paginas e ferramentas pesadas foi concluido em `src/App.tsx`, `src/pages/Exercises.tsx` e `src/components/automaton/AutomatonEditor.tsx`.
- `[x]` Extracao de cascas de layout foi concluida com `AutomatonWorkspace`, `SimulationDock`, `SimulationInspectorPanel`, `GrammarWorkspaceShell`, `ExercisesSidebar`, `ExerciseSolverModal`, `ExerciseList`, `ExerciseVerificationPanel`, `useExerciseData`, `ContentSidebar`, `LessonHeader`, `LessonNavigator`, `LessonContent`, `ContentPreviewModal`, `useContentSelection`, `useCourseModulesData`, `ContentBlockRenderer` por subcomponentes, `EditorShell`, `EditorPrimaryToolbar`, `EditorDiagnosticsPanel` e `EditorModalStack`.
- `[x]` A reducao de sobrecarga visual do simulador foi concluida com `RegexImportCard` secundario, `SimulationInspectorPanel` tabulado e `SimulationWarningsPanel` aparecendo apenas quando ha alerta real ou contexto de AP.
- `[x]` Home sem datas envelhecidas foi concluido em `src/pages/Home.tsx`.
- `[x]` `AutomatonEditor` e `AutomatonCanvas` foram repartidos em hooks e camadas (`useEditorViewport`, `useEditorImportExport`, `useEditorConversions`, `useCanvasViewport`, `useCanvasKeyboard`, `CanvasTransitionLayer`, `CanvasStateLayer`, `CanvasContextMenu`, `CanvasSelectionDock`).

Status final: `feito`
