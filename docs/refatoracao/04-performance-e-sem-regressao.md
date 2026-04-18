# Performance e Plano Sem Regressao

## Gargalos atuais

### 1. Bundle inicial acima do necessario

Mesmo com navegacao por abas, a app importa tudo de forma eager:

- `Home`
- `Content`
- `Exercises`
- `Simulator`

Como consequencia, o bundle inicial ja leva:

- UI do editor
- dados de exercicios
- dados teoricos
- arvores de derivacao
- ferramentas de conversao

Refatoracao sugerida:

- usar `React.lazy` para `ConteudoSection`, `ExerciciosSection` e `SimulatorPage`
- lazy load de modais pesados como `ConversionTool`, `TemplatesGallery` e visualizadores

### 2. Dados pesados importados cedo demais

Arquivos como:

- `src/data/constants.ts`
- `src/data/templates.ts`
- `src/data/theoryData.ts`

entram cedo demais no grafo de importacao. Isso nao quebra a app, mas piora tempo de carregamento e memoria.

### 3. CSS com no-op visual

Foram encontradas `50` ocorrencias de classes com alta chance de nao produzir estilo real, incluindo:

- `bg-surface-1/80`
- `bg-surface-1/90`
- `bg-status-warning-soft/50`
- `border-default/50`
- `bg-surface-muted/30`
- `shadow-apple-2xl`

Como essas classes nao aparecem no CSS gerado, parte do layout atual depende de estilos que nao existem.

### 4. Animacao e efeitos globais

Ha custo global em:

- `PageAmbientBackground`
- `CustomCursor`
- animacoes utilitarias registradas globalmente

Esses recursos devem ser mantidos, mas com uso mais seletivo:

- cursor customizado apenas quando ativado
- fundos mais leves nas telas de trabalho
- evitar camadas animadas concorrentes sobre a area util do simulador

## Guardrails de regressao

## O que ja esta protegido

Hoje a base ja possui testes para:

- `SimulationEngine`
- conversoes em `src/utils/conversions/**`
- `useAutomatonSimulation`
- `ConversionTool`

## O que ainda falta proteger antes da refatoracao visual

- troca de layout do simulador (`bottom`, `side`, `top_side`)
- alternancia `automaton` vs `grammar`
- importacao de regex na tela do simulador
- atalhos de teclado do simulador
- fluxo de abrir/fechar modais grandes
- navegacao principal com `useRouteState`

## Sequencia segura de implementacao

### Fase 1

- mover CSS quebrado para `src/index.css`
- substituir classes no-op por tokens validos
- remover codigo morto sem dependencias

### Fase 2

- lazy load por aba e por modal
- manter assinatura dos hooks atuais

### Fase 3

- extrair `SimulatorShell` e `EditorShell`
- adicionar testes de interface para os fluxos principais

### Fase 4

- revisar refinamento visual fino
- so entao reduzir ou reorganizar comandos avancados

## Checklist de aceite

Cada etapa de refatoracao deve validar:

- `npm run lint`
- `npm run test`
- `npm run build`
- validacao manual do simulador com AFD, AFN, AP e MT
- validacao manual da workspace de gramatica
- checagem mobile da navbar, sidebars e modais

## Checklist de implementacao

- `[x]` `React.lazy` foi aplicado para `ConteudoSection`, `ExerciciosSection` e `SimulatorPage`.
- `[x]` O lazy load de modais/ferramentas pesadas foi aplicado para `ConversionTool`, `TemplatesGallery` e o `AutomatonEditor` carregado sob demanda no preview expandido de `Content`.
- `[x]` O CSS quebrado/no-op foi corrigido em `src/index.css`.
- `[x]` Codigo morto sem dependencias foi removido antes de refatoracoes maiores.
- `[x]` A fase de extracao de shell visual foi concluida com `EditorShell`, `EditorPrimaryToolbar`, `EditorDiagnosticsPanel`, `EditorModalStack`, `SimulationDock`, `SimulationInspectorPanel`, `GrammarWorkspaceShell`, `useCanvasViewport`, `useCanvasKeyboard`, `CanvasTransitionLayer`, `CanvasStateLayer`, `CanvasContextMenu` e `CanvasSelectionDock`.
- `[x]` Os dados pesados de `src/data/constants.ts`, `src/data/templates.ts` e `src/data/theoryData.ts` deixaram de entrar cedo no grafo principal: `TemplatesGallery` ja estava atras de lazy load, e `exerciciosDB` / `courseModules` passaram a carregar sob demanda via `useExerciseData` e `useCourseModulesData`.
- `[x]` O uso mais seletivo de `PageAmbientBackground` e `CustomCursor` foi revisado em `src/App.tsx`; as telas de trabalho do simulador deixaram de renderizar esses efeitos globais.
- `[x]` Foram adicionados guardrails para layout do simulador, atalhos, modais grandes e `useRouteState` com `SimulationDock.test.tsx`, `useWindowKeyboard.test.tsx`, `Modal.test.tsx` e `routeState.test.ts`.
- `[x]` `npm run lint`, `npm run test` e `npm run build` foram validados nesta rodada em `2026-04-15`.
- `[ ]` As validacoes manuais de AFD, AFN, AP, MT, workspace de gramatica e checagem mobile ainda nao puderam ser executadas nesta rodada automatizada.

Status final: `parcial`
