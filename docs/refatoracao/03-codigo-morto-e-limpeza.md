# Codigo Morto e Limpeza

## Codigo provavelmente morto

Os itens abaixo aparecem exportados ou isolados, mas sem uso real no fluxo principal:

| Item | Situacao |
| --- | --- |
| `src/components/automaton/EditorToolbar.tsx` | componente pronto, mas o toolbar foi reimplementado inline em `AutomatonEditor.tsx` |
| `src/components/automaton/EditorAnalysisTools.tsx` | componente pronto, mas as mesmas acoes tambem estao inline em `AutomatonEditor.tsx` |
| `src/components/automaton/EditorConvertersPanel` | exportado junto com `EditorAnalysisTools`, sem consumo real |
| `src/components/automaton/EditorPropertiesPanel.tsx` | exportado, mas sem uso no editor atual |
| `src/components/ui/DeleteConfirmDialog.tsx` | sem uso; o editor implementa um dialogo equivalente inline |
| `src/components/ui/SimulationStatus.tsx` | componente nao consumido |
| `src/types/simulation.ts` | sem imports no restante de `src/` |

## Sinais de refatoracao interrompida

O problema nao e apenas "arquivo sobrando". O problema maior e que a base passou a carregar duas abordagens em paralelo:

- componentes reutilizaveis que deveriam ser o shell
- implementacoes inline dentro de arquivos gigantes

Isso gera:

- mais superficie de manutencao
- pior navegacao de codigo
- risco de corrigir um lugar e esquecer o outro

## Limpeza sugerida

### Opcao A: reutilizar os componentes existentes

Boa quando:

- o componente isolado ainda reflete o design desejado
- o gap para o layout atual e pequeno

### Opcao B: remover o componente morto

Boa quando:

- o JSX inline ja divergiu demais
- a extracao antiga nao representa mais o fluxo do produto

## Candidatos claros a unificacao

### Dialogo de apagar tudo

- morto: `DeleteConfirmDialog.tsx`
- vivo: bloco inline no final de `AutomatonEditor.tsx`

Decisao recomendada:

- ou reutiliza `DeleteConfirmDialog`
- ou remove o arquivo morto

### Toolbar do editor

- morto: `EditorToolbar.tsx`
- vivo: toolbar reescrita dentro de `AutomatonEditor.tsx`

Decisao recomendada:

- escolher um shell unico para toolbar primaria

### Painel de analise e conversores

- mortos/parciais: `EditorAnalysisTools.tsx`, `EditorConvertersPanel`
- vivos: blocos inline em `AutomatonEditor.tsx`

Decisao recomendada:

- escolher uma arquitetura unica para ferramentas secundarias

## Limpeza que simplifica sem risco logico

- remover arquivos sem uso comprovado
- remover exports de `index.ts` que so aumentam ruido
- extrair helpers duplicados
- padronizar um unico sistema de modal
- remover comentarios de migracao que nao representam mais o estado real

## Criterio de aceite

Uma limpeza esta boa quando:

- nao altera `src/simulation/**` nem `src/utils/**` criticos
- reduz imports cruzados
- reduz JSX inline duplicado
- deixa claro qual componente e o shell oficial de cada area

## Checklist de implementacao

- `[x]` `src/components/automaton/EditorToolbar.tsx` foi removido.
- `[x]` `src/components/automaton/EditorAnalysisTools.tsx` e o export de `EditorConvertersPanel` foram removidos.
- `[x]` `src/components/automaton/EditorPropertiesPanel.tsx` foi removido.
- `[x]` `src/components/ui/SimulationStatus.tsx` foi removido.
- `[x]` `src/types/simulation.ts` foi removido.
- `[x]` Os exports mortos foram limpos de `src/components/automaton/index.ts` e `src/components/ui/index.ts`.
- `[x]` `DeleteConfirmDialog` passou a ser reutilizado em `AutomatonEditor`.
- `[x]` O modal manual de `Exercises` foi substituido pelo sistema compartilhado.
- `[x]` O helper duplicado de PDA ficou centralizado em `src/components/automaton/editor/editorUtils.ts`.
- `[x]` A revisao de comentarios de migracao e ruido historico foi concluida; os comentarios restantes em `src/types.ts`, `src/utils/geometry.ts` e `src/hooks/useProgress.ts` agora documentam compatibilidade real em vez de um estado de transicao indefinido.

Status final: `feito`
