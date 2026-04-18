# Arquitetura e Complexidade

## Problema central

A base esta funcional, mas muitos arquivos viraram "componentes-orquestradores" grandes demais. Isso aumenta o custo de qualquer mudanca de layout, dificulta teste de interface e mistura risco visual com risco logico.

## Hotspots

### `src/pages/Simulator.tsx`

Concentra:

- layout responsivo do simulador
- modo automato vs gramatica
- importacao de regex
- barras de status
- warnings
- historico
- fita/pilha
- controles de simulacao

Refatoracao sugerida:

- `SimulatorShell`
- `AutomatonWorkspace`
- `GrammarWorkspaceShell`
- `SimulationDock`
- `SimulatorStatusBar`
- `RegexImportCard`

Regra: o hook `useAutomatonSimulation` continua como fonte da verdade; a pagina so distribui estado.

### `src/components/automaton/AutomatonEditor.tsx`

Hoje mistura:

- historico/undo-redo
- import/export/share
- templates e biblioteca
- validacao e testes em lote
- conversores
- propriedades
- layout automatico
- modais
- sincronizacao de viewport

Refatoracao sugerida:

- `useEditorViewport`
- `useEditorImportExport`
- `useEditorConversions`
- `EditorShell`
- `EditorPrimaryToolbar`
- `EditorUtilitiesDrawer`
- `EditorDiagnosticsPanel`

### `src/components/automaton/AutomatonCanvas.tsx`

Hoje concentra:

- zoom
- pan
- selecao
- arraste
- caixa de selecao
- menu de contexto
- criacao de transicoes
- atalhos
- hint de curva

Refatoracao sugerida:

- `useCanvasViewport`
- `useCanvasSelection`
- `useCanvasDrag`
- `useCanvasKeyboard`
- `CanvasContextMenu`
- `CanvasSelectionDock`

Regra: separar o motor de interacao da camada SVG.

### `src/pages/Exercises.tsx`

Hoje mistura:

- listagem por categoria
- busca
- persistencia de progresso
- abertura/fechamento de solver
- validacao automatica
- equivalencia DFA
- rastreio de falha
- converter contextual
- portal/modal customizado

Refatoracao sugerida:

- `ExercisesSidebar`
- `ExerciseList`
- `ExerciseSolverModal`
- `useExerciseSelection`
- `useExerciseVerification`
- `ExerciseVerificationPanel`

### `src/pages/Content.tsx`

Hoje mistura:

- navegacao de modulo/licao
- progresso
- renderer dos blocos
- preview expandido de automato

Refatoracao sugerida:

- `ContentSidebar`
- `LessonHeader`
- `ContentBlockRenderer` por subcomponentes
- `LessonNavigator`

## Duplicacoes e acoplamentos ruins

### Helper duplicado

`getPdaProps` existe em:

- `src/components/automaton/AutomatonEditor.tsx`
- `src/components/automaton/EditorPropertiesPanel.tsx`

Esse helper deve morar em um util compartilhado do editor.

### Dois sistemas de modal

- sistema compartilhado via `src/components/ui/Modal.tsx`
- modal manual com portal em `src/pages/Exercises.tsx`

Manter dois modelos de dialogo aumenta custo de acessibilidade, foco e scroll lock.

### Atalhos distribuidos em muitos niveis

Atalhos existem em:

- `src/pages/Simulator.tsx`
- `src/components/automaton/AutomatonEditor.tsx`
- `src/components/automaton/AutomatonCanvas.tsx`

Mesmo quando nao ha bug imediato, isso e uma area de alto atrito para manutencao. O ideal e centralizar a intencao dos atalhos e deixar cada camada reagir apenas ao que lhe pertence.

## Fronteiras que devem ser mantidas

Durante a refatoracao, a logica de simulacao nao deve ser "arrastada" junto com a interface.

Manter estavel:

- contratos de `useAutomatonSimulation`
- contratos de `useGrammarSimulation`
- tipos de `SimulationStep`
- utilitarios de conversao e simulacao em `src/utils/**`
- `SimulationEngine` e strategies em `src/simulation/**`

## Estrategia segura

1. Extrair componentes visuais sem mudar assinatura de hooks.
2. Adicionar testes de caracterizacao para fluxo de UI antes de mexer em atalhos.
3. So depois mover logica auxiliar para hooks menores.
4. Nao reescrever canvas e editor no mesmo ciclo.

## Checklist de implementacao

- `[x]` `src/pages/Simulator.tsx` foi quebrado com `AutomatonWorkspace`, `SimulatorModeSelector`, `SimulatorStatusBar`, `RegexImportCard`, `SimulationDock` e `GrammarWorkspaceShell`.
- `[x]` `src/components/automaton/AutomatonEditor.tsx` foi separado em `useEditorViewport`, `useEditorImportExport`, `useEditorConversions`, `EditorShell`, `EditorPrimaryToolbar`, `EditorDiagnosticsPanel` e `EditorModalStack`.
- `[x]` `src/components/automaton/AutomatonCanvas.tsx` foi dividido em `useCanvasViewport`, `useCanvasKeyboard`, `CanvasTransitionLayer`, `CanvasStateLayer`, `CanvasContextMenu` e `CanvasSelectionDock`.
- `[x]` `src/pages/Exercises.tsx` foi simplificado com `ExercisesSidebar`, `ExerciseSolverModal`, `ExerciseList`, `ExerciseVerificationPanel`, `useExerciseSelection` e `useExerciseVerification`.
- `[x]` `src/pages/Content.tsx` foi simplificado com `ContentSidebar`, `LessonHeader`, `LessonContent`, `ContentPreviewModal`, `useContentSelection`, `LessonNavigator` e `ContentBlockRenderer` quebrado por subcomponentes.
- `[x]` O helper de PDA deixou de viver em paralelo e hoje fica centralizado em `src/components/automaton/editor/editorUtils.ts`.
- `[x]` O problema de dois sistemas de modal foi resolvido no fluxo principal de exercicios com reutilizacao de `src/components/ui/Modal.tsx`.
- `[x]` A centralizacao de atalhos entre `Simulator`, `AutomatonEditor` e `AutomatonCanvas` foi aplicada em `src/features/shortcuts` com `useWindowKeyboard`, `useModifierKey` e utilitarios compartilhados de escopo/inputs editaveis.
- `[x]` Foram adicionados guardrails para shells, layout, atalhos, modal e navegacao com `AutomatonEditor.test.tsx`, `SimulationDock.test.tsx`, `useWindowKeyboard.test.tsx`, `Modal.test.tsx`, `routeState.test.ts`, `ContentBlockRenderer.test.tsx`, `useContentSelection.test.tsx` e `useExerciseSelection.test.tsx`.

Status final: `feito`
