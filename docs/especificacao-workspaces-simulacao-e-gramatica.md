# Especificação de Interface dos Workspaces de Simulação e Gramática

## 1. Objetivo

Este documento define, de forma normativa, como deve ser a aparência, o layout, o comportamento e o padrão de testes do:

- simulador principal de autômatos;
- simuladores de exercícios em pop-up;
- previews e visualizações expandidas ao longo do conteúdo;
- aba de gramática;
- visualizações auxiliares relacionadas a árvore de derivação.

O objetivo é padronizar o produto inteiro sob um mesmo contrato visual e funcional, com prioridade explícita para:

- área útil máxima para o canvas;
- alinhamento e espaçamento consistentes;
- acessibilidade;
- performance;
- previsibilidade responsiva;
- cobertura de testes automatizados contra regressões.

Este documento deve ser tratado como especificação de implementação e critério de aceite.

---

## 2. Diagnóstico do código atual

### 2.1. Estrutura atual relevante

Os arquivos que hoje definem o comportamento principal são:

- `src/pages/Simulator.tsx`
- `src/features/simulator/components/AutomatonWorkspace.tsx`
- `src/components/automaton/AutomatonEditor.tsx`
- `src/components/automaton/editor/EditorShell.tsx`
- `src/components/automaton/AutomatonCanvas.tsx`
- `src/features/exercises/ExerciseSolverModal.tsx`
- `src/features/content/ContentPreviewModal.tsx`
- `src/components/automaton/AutomatonPreview.tsx`
- `src/pages/Grammar.tsx`
- `src/features/simulator/panels/GrammarWorkspace.tsx`

### 2.2. Problemas atuais a corrigir

#### Simulador principal

- O canvas ainda disputa espaço com grade externa, bordas e regiões persistentes demais.
- O `topBar` ocupa uma linha própria em `AutomatonWorkspace`, reduzindo altura útil antes mesmo de o usuário interagir.
- O `rightDock` usa largura fixa de `20rem` quando aberto, reduzindo o protagonismo do canvas.
- O `EditorShell` ainda trata o editor como um bloco cercado por chrome, não como a superfície principal da tela.
- O `regexImportPanel` permanece visível mesmo sendo uma ação secundária.

#### Exercícios em pop-up

- O `ExerciseSolverModal` usa `AutomatonEditor` em modo compacto, mas ainda com `padding` e moldura suficientes para desperdiçar área útil.
- O painel de verificação compete visualmente com a área de edição em vez de funcionar como rail secundário bem definido.
- Em telas médias, o comportamento de empilhamento não está descrito por contrato.

#### Previews no conteúdo e nos exercícios

- O `AutomatonPreview` é leve e adequado para preview, mas os contêineres onde ele aparece não seguem um tamanho padronizado.
- `ContentExampleBlock` e `ExerciseList` usam alturas diferentes sem uma regra comum.
- O preview expandido em `ContentPreviewModal` reutiliza o editor inteiro em modo leitura, o que é funcional, mas não é o contrato visual ideal para visualização rápida.

#### Gramática

- A aba de gramática (`GrammarWorkspace`) tem bom conteúdo funcional, mas ainda não segue o mesmo contrato espacial do simulador.
- O layout atual usa sidebar fixa + barra inferior absoluta, porém sem a mesma lógica de área dominante e overlays controlados.
- A árvore de derivação ainda não tem uma grade de encaixe e escalonamento especificada em relação ao restante do site.

### 2.3. Gaps atuais de teste

Hoje existem guardrails úteis em:

- `AutomatonEditor.test.tsx`
- `SimulationDock.test.tsx`
- `Modal.test.tsx`
- `ContentBlockRenderer.test.tsx`
- `ExerciseVerificationPanel.test.tsx`

Ainda faltam testes específicos para:

- viewport do canvas;
- comportamento por breakpoint;
- modal de preview do conteúdo;
- layout e acessibilidade do solver de exercícios;
- aba de gramática;
- consistência visual dos previews;
- regressão visual por screenshot.

---

## 3. Princípio central do design

### 3.1. Regra principal

O canvas do simulador principal deve ser a superfície dominante da tela.

Isso significa:

- nenhum painel persistente deve competir com ele no estado padrão;
- nenhum cabeçalho estrutural deve consumir uma linha inteira se puder virar overlay;
- o editor deve parecer uma área expansível e navegável, com sensação de canvas infinito;
- ferramentas, diagnósticos e inspeção devem ser camadas secundárias, não a moldura principal da experiência.

### 3.2. Regra de família visual

Todos os contextos abaixo devem parecer parte do mesmo sistema:

- simulador principal;
- solver de exercícios;
- preview expandido do conteúdo;
- preview inline;
- aba de gramática;
- árvore de derivação.

Os componentes podem variar em densidade, mas não em linguagem espacial.

### 3.3. Hierarquia visual obrigatória

1. Superfície principal: canvas ou área de derivação.
2. Controle primário: entrada, executar, pausar, resetar.
3. Inspeção secundária: histórico, fita, alertas, propriedades, verificação.
4. Ferramentas avançadas: importação, exportação, conversões, templates, biblioteca.

Ferramentas avançadas não podem ocupar o primeiro plano por padrão.

---

## 4. Sistema visual unificado

## 4.1. Breakpoints oficiais

- `mobile`: 360 a 639 px
- `tablet`: 640 a 1023 px
- `desktop`: 1024 a 1439 px
- `wide`: 1440 px ou mais

## 4.2. Escala de espaçamento

Somente esta escala deve ser usada nos workspaces:

| Token | Valor |
| --- | --- |
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 24 px |
| `space-6` | 32 px |
| `space-7` | 40 px |
| `space-8` | 48 px |
| `space-9` | 64 px |

Regra:

- não usar espaçamentos arbitrários fora dessa escala para shells de layout;
- offsets absolutos só são permitidos para ancoragem de overlays, e mesmo assim devem derivar desta escala.

## 4.3. Raios de borda

- `radius-card`: 24 px
- `radius-stage`: 28 px
- `radius-dock`: 24 px
- `radius-pill`: 999 px

Regra:

- stage principal usa `28 px`;
- cards internos usam `24 px`;
- chips e segmentados usam `pill`.

## 4.4. Tipografia de interface

- rótulo técnico pequeno: 11 px, peso 700
- metadado/chip: 10 a 11 px, peso 700
- texto operacional padrão: 14 px
- título de painel: 16 px
- título de seção: 20 px
- título de workspace: 24 px

## 4.5. Contraste e superfícies

- canvas deve usar fundo próprio, distinto do fundo do app;
- o fundo do workspace não deve competir com o grid do canvas;
- overlays devem usar superfície translúcida, mas com contraste suficiente para leitura;
- texto sobre glass nunca pode cair abaixo de contraste AA.

---

## 5. Contrato espacial compartilhado dos workspaces

## 5.1. Banda superior

A `TopNav` continua fixa. O workspace deve respeitar a seguinte área segura:

- `mobile`: 80 px de afastamento superior
- `tablet`: 88 px
- `desktop` e `wide`: 96 px

## 5.2. Moldura externa do workspace

Cada workspace de tela cheia deve usar:

- `mobile`: `padding-inline` 12 px, `padding-bottom` 12 px
- `tablet`: 16 px
- `desktop`: 20 px
- `wide`: 24 px

## 5.3. Stage principal

O stage principal é o retângulo onde o canvas ou a área de derivação vive.

Requisitos:

- ocupar toda a altura restante após a banda superior;
- altura mínima:
  - `mobile`: `calc(100dvh - 92px)`
  - `tablet`: `calc(100dvh - 104px)`
  - `desktop` e `wide`: `calc(100dvh - 116px)`
- borda de 1 px com baixo contraste;
- `border-radius: 28px`;
- `overflow: hidden`;
- nenhuma segunda moldura estrutural dentro dele.

## 5.4. Overlays flutuantes

Todos os overlays do workspace devem obedecer:

- distância mínima de 16 px das bordas internas do stage;
- alinhamento aos mesmos eixos horizontais;
- separação mínima de 12 px entre overlays independentes;
- nenhuma colisão com o dock inferior;
- nenhum overlay pode impedir leitura da área central do canvas por padrão.

---

## 6. Especificação do simulador principal

## 6.1. Objetivo visual

O simulador principal deve passar a sensação de laboratório visual aberto, com canvas expansível e quase infinito.

O usuário deve perceber, em 2 segundos, esta ordem:

1. área grande para desenhar e navegar;
2. ferramentas para editar;
3. barra de entrada e execução;
4. inspeção sob demanda.

## 6.2. Estrutura obrigatória

O simulador principal terá 5 zonas, nesta ordem hierárquica:

1. `Stage` do canvas.
2. `Tool Rail` flutuante à esquerda.
3. `Workspace Meta` flutuante no topo esquerdo.
4. `Inspector` recolhível à direita.
5. `Simulation Dock` centralizado embaixo.

## 6.3. Layout por breakpoint

### Mobile

- canvas ocupa 100% do stage;
- `Tool Rail` vira botão de abertura com painel flutuante;
- `Inspector` nunca ocupa coluna fixa; vira sheet inferior;
- `Simulation Dock` ocupa largura total útil;
- minimapa é opcional e só aparece quando houver mais de 6 estados.

### Tablet

- canvas ocupa 100% do stage;
- `Tool Rail` flutuante vertical;
- `Inspector` continua recolhível e sobreposto;
- `Simulation Dock` centralizado com largura entre 92% e 100%;
- top chips ficam em uma única faixa flexível.

### Desktop

- canvas ocupa 100% do stage no estado padrão;
- `Inspector` abre sobreposto à direita, sem reflow do canvas;
- largura do `Inspector`: 360 px;
- largura máxima do `Simulation Dock`: 960 px;
- `Tool Rail`: 64 px de largura útil.

### Wide

- igual ao desktop;
- `Inspector` pode crescer até 380 px;
- `Simulation Dock` pode crescer até 1040 px;
- área visível do canvas, mesmo com inspector aberto, deve permanecer com no mínimo 72% da largura do stage.

## 6.4. Canvas

### Área útil

No estado padrão, o canvas deve ocupar:

- 100% da largura interna do stage;
- 100% da altura interna do stage;
- sem linha de cabeçalho separada acima dele.

### Fundo e grid

O canvas deve ter:

- fundo base contínuo;
- grid leve em duas intensidades;
- leitura clara de profundidade, sem parecer papel quadriculado pesado.

Especificação:

- grid menor a cada 24 px com opacidade muito baixa;
- grid maior a cada 96 px com opacidade levemente maior;
- o centro visual do canvas não deve receber moldura, vinheta ou cartão.

### Comportamento

- zoom por roda do mouse centrado no cursor;
- `fit to content` deve centralizar o autômato sem prender o usuário a uma área pequena;
- pan por `Space + drag`, botão do meio ou gesto equivalente;
- coordenadas negativas devem ser permitidas;
- estados muito afastados não podem quebrar o cálculo de enquadramento.

### Primitivas visuais

- diâmetro do estado: 56 px
- raio do estado: 28 px
- círculo final interno: 48 px
- seta inicial: 18 px antes do círculo
- rótulo de transição:
  - altura mínima: 24 px
  - padding horizontal interno: 8 px
  - padding vertical interno: 4 px
  - `font-size`: 12 px em mono

### Sensação de infinito

Para a percepção de canvas infinito:

- nenhum card branco deve centralizar o desenho;
- o fundo deve existir até as bordas do stage;
- overlays devem parecer suspensos sobre o canvas, não empilhados ao redor dele;
- o minimapa deve reforçar navegação, não virar um quadro concorrente.

## 6.5. Workspace Meta

Substitui o topo estrutural atual.

Deve ficar em overlay no canto superior esquerdo do stage:

- distância do topo: 16 px
- distância da esquerda: 16 px
- empilhamento vertical com gap de 8 px
- largura máxima do grupo: 420 px

Conteúdo:

- título do workspace;
- tipo do autômato;
- contagem de estados/transições;
- status de execução.

Regra:

- `Regex → AFN` sai dessa faixa e vira ação secundária do rail de utilidades.

## 6.6. Tool Rail

Especificação:

- posição: canto esquerdo do stage;
- topo: 88 px abaixo da borda superior interna do stage;
- esquerda: 16 px;
- largura: 64 px;
- gap vertical entre grupos: 12 px;
- botões com área clicável mínima de 44 x 44 px.

Conteúdo visível por padrão:

- mover;
- estado;
- transição;
- apagar;
- desfazer;
- refazer;
- abrir painel de utilidades.

Conteúdo secundário:

- templates;
- biblioteca;
- importar;
- exportar;
- compartilhar;
- importação de gramática;
- regex.

Essas ações secundárias devem abrir drawer flutuante ou sheet contextual.

## 6.7. Inspector

O inspetor deixa de reservar coluna fixa por padrão.

Regra obrigatória:

- fechado por padrão;
- abre por demanda;
- sobreposto ao stage;
- não reposiciona o canvas;
- largura:
  - `mobile`: 100% útil em sheet inferior
  - `tablet`: 420 px máximo, sobreposto
  - `desktop`: 360 px
  - `wide`: 380 px

Abas:

- visualização/fita;
- alertas;
- histórico;
- propriedades avançadas, quando necessário.

## 6.8. Simulation Dock

É o principal controle operacional.

Posição:

- centro inferior do stage;
- afastamento inferior: 16 px;
- afastamento lateral mínimo: 16 px.

Dimensões:

- altura alvo desktop: 88 px a 104 px;
- altura alvo mobile: 104 px a 128 px;
- largura:
  - `mobile`: 100% útil
  - `tablet`: até 92% do stage
  - `desktop`: `clamp(720px, 74vw, 960px)`
  - `wide`: `clamp(760px, 70vw, 1040px)`

Ordem interna:

1. entrada;
2. modo de tokenização;
3. controles de execução;
4. passo atual;
5. abrir inspetor/histórico;
6. reset rápido.

## 6.9. Minimap

Posição:

- canto inferior esquerdo do stage;
- 16 px da borda esquerda;
- 16 px acima da borda superior do `Simulation Dock`.

Dimensões:

- padrão: 168 x 112 px;
- `wide`: 192 x 128 px.

Regra:

- só aparece com mais de 6 estados;
- desaparece quando colidir com sheet móvel no `mobile`.

## 6.10. Empty state

Quando não houver estados:

- a mensagem deve aparecer centralizada no canvas;
- não pode deslocar o layout externo;
- deve sugerir duas ações:
  - criar estado;
  - carregar template.

---

## 7. Correções obrigatórias no simulador principal

### 7.1. `src/features/simulator/components/AutomatonWorkspace.tsx`

Correção:

- remover a linha estrutural dedicada ao `topBar`;
- transformar `topBar` em overlay ancorado ao stage;
- remover a dependência de coluna fixa para o inspetor como estado padrão;
- preservar `bottomDock` como dock sobreposto, não como terceira linha da grade.

### 7.2. `src/components/automaton/editor/EditorShell.tsx`

Correção:

- reduzir a quantidade de `padding` estrutural ao redor do canvas;
- tratar o canvas como stage principal;
- em modo `compact`, `padding` externo máximo de 8 px;
- em modo normal, o chrome deve se comportar como overlays e rails, não como colunas pesadas.

### 7.3. `src/pages/Simulator.tsx`

Correção:

- `regexImportPanel` deve deixar o primeiro plano e ir para utilidades;
- `workspaceHeader` e `statsPanel` devem virar overlays compactos;
- o estado padrão deve abrir com maior área útil possível para o canvas.

### 7.4. `src/components/automaton/AutomatonCanvas.tsx`

Correção:

- adotar grid em dois níveis;
- reforçar contraste de seleção sem depender só de cor;
- garantir `fit to content` estável em autômatos muito pequenos ou muito grandes;
- garantir centralização correta após resize, abertura de modal e troca de aba.

---

## 8. Especificação dos simuladores de exercícios em pop-up

## 8.1. Objetivo visual

O solver de exercícios deve parecer um workspace reduzido do simulador principal, não um modal genérico com editor encaixado.

## 8.2. Dimensões do modal

- largura: `min(96vw, 1440px)`
- altura: `min(92dvh, 1024px)`
- `mobile`: altura mínima útil de 88dvh

## 8.3. Layout interno

### Desktop e wide

- área de edição: `minmax(0, 1fr)`
- rail de verificação: 360 px
- separador vertical de 1 px
- canvas com prioridade visual total no painel esquerdo

### Tablet

- rail de verificação pode reduzir até 320 px;
- se a área de edição ficar abaixo de 720 px de largura útil, o rail de verificação passa para modo sheet inferior.

### Mobile

- canvas/editor no topo com altura mínima de 52 vh;
- painel de verificação abaixo, com altura entre 32 vh e 40 vh;
- ações de cabeçalho reduzidas a ícones essenciais.

## 8.4. Editor compacto no modal

Contrato:

- sem barra inferior persistente;
- sem cards laterais fixos;
- ferramentas via launcher flutuante;
- inspetor via launcher flutuante;
- canvas ocupando o máximo possível da área esquerda.

Correção necessária:

- o `compact` atual de `AutomatonEditor` deve reduzir ainda mais o chrome estrutural;
- o editor compacto não deve parecer um card dentro de outro card.

## 8.5. Rail de verificação

Especificação:

- largura desktop: 360 px;
- padding interno: 16 px;
- gap vertical entre blocos: 12 px;
- CTA de verificar sempre fixado ao rodapé do rail;
- lista de testes com scroll próprio;
- mensagens de falha e equivalência com contraste alto.

## 8.6. Outros modos do solver

### Regex

- campo principal com largura total;
- ajuda sintática em card secundário;
- sem competir com o CTA principal.

### Gramática

- textarea com 16 px de padding interno;
- altura:
  - `mobile`: 240 px
  - `tablet`: 280 px
  - `desktop`: 320 px
- árvore de derivação de falha em bloco secundário abaixo.

### Texto livre

- textarea com altura mínima de 240 px;
- CTA de marcar concluído alinhado à esquerda;
- feedback de concluído alinhado à mesma linha-base.

---

## 9. Especificação dos previews inline e expandidos

## 9.1. Regra geral

Preview inline usa viewer leve e estático.

Não se deve montar o editor completo em previews inline.

## 9.2. Preview inline em conteúdo

Componente alvo:

- `src/features/content/ContentExampleBlock.tsx`

Contrato:

- usar `aspect-ratio: 16 / 10`;
- altura mínima:
  - `mobile`: 220 px
  - `tablet`: 260 px
  - `desktop`: 320 px
- borda suave de 1 px;
- fundo igual ao canvas principal;
- botão de expandir no canto superior direito;
- CTA de simular fora do preview, no header do bloco.

Quando houver `Antes` e `Depois`:

- os dois previews devem ter a mesma altura;
- gap horizontal: 24 px no desktop, 16 px no tablet;
- no mobile, empilhar verticalmente com 16 px de separação.

## 9.3. Preview inline em exercícios

Componente alvo:

- `src/features/exercises/ExerciseList.tsx`

Contrato:

- usar o mesmo `aspect-ratio: 16 / 10`;
- altura mínima:
  - `mobile`: 224 px
  - `tablet`: 260 px
  - `desktop`: 320 px
- ações `Converter` e `Simular` acima do preview;
- preview nunca pode parecer mais importante que o enunciado.

## 9.4. Preview expandido do conteúdo

Componente alvo:

- `src/features/content/ContentPreviewModal.tsx`

Correção obrigatória:

- substituir o uso do editor completo em modo leitura por um viewer dedicado, com chrome mínimo.

Especificação:

- largura: `min(94vw, 1280px)`
- altura: `min(88dvh, 920px)`
- stage do viewer ocupando 100% da área útil;
- controles permitidos:
  - zoom in;
  - zoom out;
  - ajustar ao conteúdo;
  - abrir no simulador principal, quando fizer sentido.

Não deve exibir:

- barra de ferramentas de edição;
- propriedades;
- utilidades de importação/exportação;
- qualquer affordance de escrita.

## 9.5. `AutomatonPreview`

Componente alvo:

- `src/components/automaton/AutomatonPreview.tsx`

Contrato visual:

- padding interno virtual de 64 px no `viewBox`;
- rótulo legível em 12 px;
- círculo do estado visualmente compatível com o simulador principal;
- mesmo esquema de cor do canvas;
- `aria-label` obrigatório e contextual.

---

## 10. Especificação da aba de gramática

## 10.1. Objetivo visual

A aba de gramática deve usar o mesmo vocabulário espacial do simulador principal.

Ela não é uma página “outra”; ela é o segundo laboratório visual do produto.

## 10.2. Estrutura obrigatória

1. Stage principal de resultados/árvore.
2. Rail de edição da gramática.
3. Meta no topo esquerdo.
4. Dock inferior para palavra, estratégia e ação.
5. Painel de transformações como rail secundário ou aba do rail.

## 10.3. Layout por breakpoint

### Mobile

- rail da gramática recolhido em sheet superior ou painel expansível;
- árvore/resultados ocupa o stage;
- dock inferior ocupa largura total útil.

### Tablet

- rail lateral de 320 px, recolhível;
- stage ocupa o restante;
- transformações entram como seção do rail.

### Desktop

- rail fixo à esquerda com 360 px;
- stage principal à direita ocupando o restante;
- dock inferior alinhado com o padrão do simulador.

### Wide

- rail esquerdo de 380 px;
- stage com largura restante;
- largura máxima do conteúdo textual de explicação dentro do stage: 960 px.

## 10.4. Rail da gramática

Conteúdo:

- presets rápidos;
- textarea da gramática;
- limites de execução;
- transformações;
- avisos de parsing.

Especificação:

- largura desktop: 360 px;
- padding interno: 24 px;
- gap entre blocos: 16 px;
- textarea com altura de 280 px a 320 px;
- avisos sempre abaixo do campo, nunca acima.

## 10.5. Stage de resultado

No estado com resultado:

- título do status no topo;
- palavra testada logo abaixo;
- explicação da razão em card secundário;
- árvore de derivação em stage interno com altura:
  - `mobile`: 320 px
  - `tablet`: 400 px
  - `desktop`: 520 px
- lista de passos abaixo em grade responsiva.

No estado vazio:

- centro do stage;
- uma única mensagem primária;
- uma única explicação secundária;
- sem excesso decorativo.

## 10.6. Dock inferior da gramática

Mesmo padrão do simulador:

- alinhado ao centro inferior;
- largura:
  - `mobile`: 100%
  - `tablet`: 92%
  - `desktop`: `clamp(720px, 74vw, 980px)`
- conteúdo:
  - campo da palavra;
  - seletor esquerda/direita;
  - botão `Derivar`;
  - limpar.

## 10.7. Árvore de derivação

Componente alvo:

- `src/components/ui/DerivationTreeVisualizer.tsx`

Correções obrigatórias:

- ter modo inline e modo expandido com a mesma identidade visual;
- usar mesmas superfícies do restante do workspace;
- suportar zoom e pan no modo expandido;
- não depender só do autoplay como forma de inspeção;
- exibir estado atual com contraste forte, sem depender só de cor.

---

## 11. Alinhamento e espaçamento

Esta seção é mandatória.

## 11.1. Linhas de alinhamento

Todos os workspaces devem usar três linhas principais:

- linha esquerda de safe area;
- linha central do stage;
- linha direita de safe area.

Os seguintes elementos devem alinhar com a mesma linha esquerda do stage:

- meta/header flutuante;
- tool rail;
- minimapa;
- rail da gramática;
- início do conteúdo principal nos modais.

## 11.2. Regras de gap

- gap entre grupos de overlays: 12 px
- gap entre cards internos: 16 px
- gap entre blocos maiores: 24 px
- gap entre seções do rail: 16 px
- gap entre ações no mesmo grupo: 8 px

## 11.3. Regras de centragem

- o `Simulation Dock` e o dock da gramática devem ser centralizados horizontalmente;
- o estado vazio deve ser centralizado no stage;
- o rail de verificação do solver nunca pode desalinhar o topo em relação ao cabeçalho do modal.

## 11.4. Regras de densidade

- nenhum rail lateral pode ter mais de 4 blocos persistentes visíveis sem scroll;
- ações raras devem ir para drawer ou accordion;
- informações diagnósticas não podem empurrar o canvas para baixo.

---

## 12. Acessibilidade obrigatória

## 12.1. Navegação por teclado

Obrigatório em todos os workspaces:

- `Tab` navegando por controles principais em ordem lógica;
- foco visível sempre;
- `Esc` fecha modal, drawer ou sheet aberto;
- atalhos do canvas não podem disparar quando o foco estiver em campo editável;
- o foco deve retornar ao elemento de origem após fechar modal.

## 12.2. Canvas

Como o canvas é altamente visual, é obrigatório oferecer alternativas:

- região com `aria-label` contextual;
- resumo textual do estado atual da simulação;
- status de execução via região `aria-live="polite"`;
- lista de estados ativos e resultado sem depender de cor;
- comandos principais acessíveis fora do SVG.

## 12.3. Tamanho de alvo

- botões mínimos de 44 x 44 px;
- chips interativos nunca abaixo de 36 px de altura;
- ícones isolados sempre com `aria-label`.

## 12.4. Contraste

Obrigatório:

- texto normal AA;
- texto pequeno AA;
- estados de erro, sucesso e aviso não podem depender só de cor;
- bordas de foco precisam ser visíveis em light e dark.

## 12.5. Movimento reduzido

- respeitar `prefers-reduced-motion`;
- autoplay de árvore não pode ser a única forma de leitura;
- transições decorativas devem ser desligáveis.

## 12.6. Modais

- `role="dialog"` e `aria-modal="true"`;
- título associado via `aria-labelledby`;
- descrição opcional via `aria-describedby`;
- lock de scroll no fundo;
- trap de foco.

---

## 13. Performance obrigatória

## 13.1. Regras gerais

- previews inline usam sempre viewer leve e estático;
- editor completo só pode ser montado quando necessário;
- inspector pesado só monta conteúdo da aba ativa;
- árvore expandida só abre viewer pesado sob demanda;
- nenhuma animação global deve rodar por trás dos workspaces de simulador e gramática.

## 13.2. Canvas

- drag e pan continuam com `requestAnimationFrame`;
- não recalcular layout pesado a cada render sem necessidade;
- `fit to content` não deve disparar em interações irrelevantes;
- resize deve ser tratado sem loops de render.

## 13.3. Histórico e listas

- limitar altura e usar scroll interno apenas nos painéis auxiliares;
- se histórico crescer demais, preparar paginação ou janela visível;
- evitar repaint pesado com sombras grandes em listas longas.

## 13.4. Modais

- `ContentPreviewModal` e viewers expandidos devem ser lazy;
- solver de exercícios não deve abrir componentes auxiliares desnecessários por padrão.

---

## 14. Bugs e edge-cases que a implementação deve cobrir

## 14.1. Canvas

- autômato vazio;
- autômato com um único estado;
- estados com coordenadas negativas;
- estados muito distantes entre si;
- transições de loop e múltiplas transições paralelas;
- labels longos;
- resize de janela;
- abertura do simulador a partir de conteúdo/exercício com `fit` correto;
- retorno do modal com viewport estável.

## 14.2. Solver de exercícios

- modal aberto em viewport pequena;
- alternância entre modos automato, regex, gramática e texto;
- rail de verificação com muitos testes;
- sem testes automáticos;
- falha com traço longo;
- teclado `Ctrl + Enter`.

## 14.3. Conteúdo

- preview inline com autômato vazio;
- preview expandido com autômato grande;
- before/depois com tamanhos equivalentes;
- abrir preview e depois mandar para o simulador principal.

## 14.4. Gramática

- gramática inválida;
- gramática com muitos avisos;
- árvore muito larga;
- derivação longa;
- transformação sem resultado;
- retorno ao estado vazio.

---

## 15. Padrão de testes automatizados

## 15.1. Regra geral

Os testes precisam validar:

- contrato estrutural;
- acessibilidade básica;
- comportamento por breakpoint;
- fluxos críticos de interação;
- regressão visual.

Vitest + Testing Library continuam para testes funcionais.

Deve ser adicionada camada de screenshot E2E com Playwright.

Deve ser adicionada checagem de acessibilidade automatizada com `axe`.

## 15.2. Matriz mínima de viewport

Todos os testes de layout e screenshot devem rodar em:

- `390 x 844`
- `768 x 1024`
- `1280 x 800`
- `1440 x 900`

## 15.3. Testes obrigatórios por área

### Simulador principal

Arquivos recomendados:

- `src/pages/Simulator.layout.test.tsx`
- `src/components/automaton/canvas/useCanvasViewport.test.ts`
- `src/components/automaton/editor/useEditorViewport.test.ts`
- `src/features/simulator/components/AutomatonWorkspace.test.tsx`

Cobertura mínima:

- canvas ocupa a área dominante no estado padrão;
- inspetor abre sem causar reflow estrutural do canvas no desktop;
- dock inferior continua acessível em todos os breakpoints;
- `fit to content` após receber automato vindo de outra aba;
- ferramentas avançadas não aparecem no primeiro plano por padrão.

### Solver de exercícios

Arquivos recomendados:

- `src/features/exercises/ExerciseSolverModal.test.tsx`
- `src/features/exercises/ExerciseSolverModal.a11y.test.tsx`

Cobertura mínima:

- modal abre com foco correto;
- rail de verificação fixa CTA no rodapé;
- editor compacto preserva área útil;
- empilhamento mobile funciona;
- `Ctrl + Enter` dispara verificação;
- fechar modal devolve foco.

### Previews

Arquivos recomendados:

- `src/features/content/ContentPreviewModal.test.tsx`
- `src/components/automaton/AutomatonPreview.test.tsx`

Cobertura mínima:

- preview inline renderiza viewer leve;
- modal expandido usa viewer somente leitura;
- botão de expandir existe e é acessível;
- abrir preview e mandar para simulador principal preserva dados.

### Gramática

Arquivos recomendados:

- `src/pages/Grammar.layout.test.tsx`
- `src/features/simulator/panels/GrammarWorkspace.test.tsx`
- `src/components/ui/DerivationTreeVisualizer.test.tsx`

Cobertura mínima:

- rail e stage seguem layout previsto;
- dock inferior permanece acessível;
- árvore inline e expandida renderizam corretamente;
- estado vazio e estado com resultado possuem hierarquia estável;
- autoplay respeita modo reduzido.

## 15.4. Testes de acessibilidade

Obrigatórios em:

- simulador principal;
- solver modal;
- preview modal;
- aba de gramática.

Checagens:

- ausência de violações graves no `axe`;
- foco visível;
- diálogos nomeados;
- botões com nome acessível;
- ordem de tab razoável.

## 15.5. Testes de regressão visual

Obrigatório adicionar snapshots de:

- simulador vazio;
- simulador com autômato pequeno;
- simulador com inspetor aberto;
- solver modal desktop;
- solver modal mobile;
- preview inline simples;
- preview before/depois;
- gramática vazia;
- gramática com árvore e passos.

Regra:

- qualquer mudança de spacing, alinhamento, largura de dock, altura de canvas, ou posição de rail deve quebrar snapshot se sair do contrato.

## 15.6. Validação manual obrigatória

Mesmo com cobertura automatizada, o aceite final precisa validar manualmente:

1. AFD
2. AFN
3. AP
4. MT
5. preview inline
6. preview expandido
7. solver de exercício
8. aba de gramática
9. mobile real ou emulador confiável

---

## 16. Plano de correção incremental

## Fase 1. Shell e área útil

- refatorar `AutomatonWorkspace` para overlay-first;
- refatorar `EditorShell` para stage-first;
- mover header/meta para overlay;
- remover `regexImportPanel` do primeiro plano.

## Fase 2. Previews e pop-ups

- criar viewer somente leitura para preview expandido;
- padronizar proporções dos previews inline;
- ajustar solver modal para canvas dominante.

## Fase 3. Gramática

- alinhar `GrammarWorkspace` ao mesmo contrato espacial;
- padronizar dock inferior;
- adequar árvore de derivação ao sistema visual comum.

## Fase 4. Testes

- adicionar testes de viewport;
- adicionar testes de acessibilidade;
- adicionar regressão visual com Playwright;
- fechar checklist manual.

---

## 17. Critérios finais de aceite

Esta especificação só é considerada implementada quando todas as condições abaixo forem verdadeiras:

- o simulador principal abrir com canvas visualmente dominante;
- o canvas parecer quase infinito;
- os painéis auxiliares forem secundários por padrão;
- exercícios em modal usarem o mesmo sistema espacial do simulador;
- previews inline e expandidos seguirem proporção e comportamento padronizados;
- a aba de gramática casar visualmente com o simulador;
- alinhamento e espaçamento forem consistentes entre todos os formatos;
- acessibilidade e performance estiverem cobertas por contrato;
- a suíte de testes automatizados cobrir estrutura, comportamento, acessibilidade e regressão visual.

Status esperado deste documento: especificação-base para implementação visual e técnica dos workspaces.

---

## 18. Checklint de implementação

### Feito

- [x] Simulador principal refatorado para stage dominante, meta flutuante, inspetor sob demanda e dock inferior sobreposto.
- [x] `AutomatonWorkspace` e `EditorShell` migrados para abordagem overlay-first/stage-first, reduzindo chrome estrutural.
- [x] `AutomatonEditor` compacto separado em variante de workspace e variante de modal.
- [x] `regexImportPanel` movido para utilidade secundária no workspace.
- [x] Canvas com grid em dois níveis, resumo acessível por `aria-live` e `fit to content` mais estável para estados pequenos, grandes e coordenadas negativas.
- [x] Minimap ajustado para aparecer apenas com mais de 6 estados.
- [x] Solver modal reorganizado como workspace reduzido, com editor compacto e rail de verificação mais consistente.
- [x] `ContentPreviewModal` trocado para viewer dedicado somente leitura, com zoom e ação para abrir no simulador.
- [x] `AutomatonPreview` padronizado com `aspect-ratio`, `aria-label` contextual e estado vazio legível.
- [x] Previews inline de conteúdo e exercícios padronizados em proporção `16 / 10` e alturas mínimas coerentes.
- [x] Aba de gramática refeita com stage dominante, rail de edição/transformações e dock inferior alinhado ao simulador.
- [x] `DerivationTreeVisualizer` refeito com controles manuais, modo expandido com zoom e suporte a leitura sem depender só de autoplay.
- [x] Diálogos principais com `role="dialog"`, `aria-modal`, título nomeado, lock de scroll e retorno de foco.
- [x] Testes adicionados/atualizados para simulador, gramática, solver modal, preview expandido, árvore de derivação e preview leve.
- [x] Matriz normativa de viewport (`390x844`, `768x1024`, `1280x800`, `1440x900`) coberta nos testes de layout e na configuração de regressão visual.
- [x] Suíte automatizada de acessibilidade com `axe` adicionada para simulador principal, solver modal, preview modal e aba de gramática.
- [x] Testes dedicados de viewport/canvas adicionados para `useCanvasViewport` e `useEditorViewport`.
- [x] A validação pesada de lint, Vitest segmentado, build e acessibilidade foi preparada para rodar no GitHub Actions, evitando pressão desnecessária na máquina local.

### Parcial

- [~] Regressão visual E2E com Playwright está especificada, com cenários prontos e workflow manual no GitHub Actions para gerar baselines; ainda falta consolidar e versionar os snapshots obrigatórios no repositório.
- [~] Lint, build e a suíte Vitest já passaram em etapa anterior da implementação, mas a revalidação completa após o ajuste de perfil local/CI ficou pendente para execução no GitHub Actions.

### Não feito

- [ ] Checklist manual final de aceite cobrindo AFD, AFN, AP, MT, preview inline, preview expandido, solver, aba de gramática e validação em mobile real/emulador confiável.
