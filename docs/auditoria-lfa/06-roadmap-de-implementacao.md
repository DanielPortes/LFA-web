# Roadmap de Implementação

## Objetivo

Este roadmap organiza a execução da reconstrução em fases pragmáticas. A ideia é evitar duas falhas comuns:

- tentar reescrever todo o conteúdo de uma vez;
- melhorar conteúdo sem melhorar o modelo estrutural que o sustenta.

## Princípio de execução

A ordem correta é:

1. reposicionar o produto;
2. enriquecer o modelo de dados;
3. corrigir e expandir a trilha central;
4. reconstruir exercícios;
5. expandir módulos avançados;
6. consolidar revisão e referência.

## Fase 0. Higiene editorial e reposicionamento

### Objetivo

Eliminar sinais de produto de turma e corrigir inconsistências editoriais visíveis.

### Arquivos-alvo

- `src/pages/Home.tsx`
- `src/pages/Content.tsx`
- `src/data/theoryData.ts`
- `src/data/theory/modules/mod7_fechamentos.ts`
- `src/data/theory/modules/mod10_glc.ts`
- `src/data/theory/modules/mod12_chomsky.ts`
- `src/data/constants.ts`

### Tarefas

- remover horários, sala, cronograma e `Turma A`;
- trocar `Material P1` por uma identidade permanente;
- corrigir títulos com regressão de encoding;
- revisar ortografia e terminologia central;
- atualizar home com nova copy de produto.

### Critério de aceite

- nenhum elemento da home depende de semestre específico;
- nenhum título de módulo exibe regressão de encoding;
- a interface principal comunica claramente `trilha`, `prática` e `simulação`.

## Fase 1. Modelo de informação pedagógica

### Objetivo

Preparar a base de dados para suportar referências, objetivos, erros comuns, busca real e solução guiada.

### Arquivos-alvo

- `src/types.ts`
- `src/data/theoryData.ts`
- `src/data/bibliography.ts`
- `src/data/contentIndex.ts`

### Tarefas

- expandir `Lesson`;
- expandir `ContentBlock`;
- adicionar tipos de referência;
- adicionar erros comuns;
- adicionar resumo e objetivos;
- criar bibliografia centralizada;
- criar índice de busca textual.

### Critério de aceite

- toda lição consegue declarar objetivos, referências, resumo e erros comuns;
- o projeto possui um arquivo central de bibliografia;
- a busca pode ser reimplementada sem depender de parsing ad hoc da UI.

## Fase 2. Reconstrução da trilha central

### Objetivo

Consolidar módulos 0 a 5 como base sólida da plataforma.

### Arquivos-alvo

- `src/data/theory/modules/mod0_fundamentos.ts`
- `src/data/theory/modules/mod1_afd.ts`
- `src/data/theory/modules/mod2_afn.ts`
- `src/data/theory/modules/mod3_er.ts`
- `src/data/theory/modules/mod4_minimizacao.ts`
- `src/data/theory/modules/mod5_propriedades.ts`

### Tarefas

- corrigir formalização de AFD;
- adicionar lições faltantes;
- introduzir mini-exercícios na teoria;
- adicionar blocos de erro comum;
- adicionar resumos por lição;
- ligar cada lição a exercícios correspondentes.

### Critério de aceite

- módulos 0 a 5 conseguem ser estudados do zero sem lacunas conceituais graves;
- AFD, AFN, ER e minimização têm continuidade pedagógica clara;
- a teoria já força checkpoints de compreensão, não apenas leitura passiva.

## Fase 3. Redesenho da experiência de exercícios

### Objetivo

Transformar o sistema de prática em um sistema de aprendizagem por etapas.

### Arquivos-alvo

- `src/types.ts`
- `src/data/constants.ts`
- `src/pages/Exercises.tsx`

### Tarefas

- introduzir `dicas` graduais;
- introduzir `guidedSolution`;
- introduzir `commonMistakes`;
- adicionar metadados pedagógicos ao exercício;
- separar `estratégia`, `solução guiada` e `gabarito final`;
- criar exercícios de debugging;
- criar exercícios discursivos estruturados.

### Critério de aceite

- pelo menos um conjunto importante de exercícios por módulo já usa solução guiada em etapas;
- o aluno consegue errar, receber feedback e continuar aprendendo sem abrir o gabarito final;
- a UI diferencia claramente prática, diagnóstico e resposta final.

## Fase 4. Reconstrução dos módulos avançados

### Objetivo

Dar densidade real à segunda metade da disciplina.

### Arquivos-alvo

- `src/data/theory/modules/mod6_gramaticas_regulares.ts`
- `src/data/theory/modules/mod7_fechamentos.ts`
- `src/data/theory/modules/mod8_aplicacoes.ts`
- `src/data/theory/modules/mod9_moore_mealy.ts`
- `src/data/theory/modules/mod10_glc.ts`
- `src/data/theory/modules/mod11_ap.ts`
- `src/data/theory/modules/mod12_chomsky.ts`
- novos módulos a criar:
  - `mod13_pumping.ts`
  - `mod14_turing.ts`
  - `mod15_decidibilidade.ts`
  - `mod16_hierarquia.ts`

### Tarefas

- expandir GR;
- separar Turing, decidibilidade e hierarquia;
- criar módulo de bombeamento;
- aprofundar GLC e AP;
- mover Moore/Mealy para papel complementar.

### Critério de aceite

- não há mais módulo obrigatório com densidade de "uma definição e um exemplo";
- o aluno consegue estudar GLC, AP e computabilidade sem depender de material externo imediato;
- `pumping` deixa de existir só como categoria de exercício.

## Fase 5. Revisão, consulta e experiência de referência

### Objetivo

Transformar o site em ferramenta de estudo contínuo, não só em trilha linear.

### Arquivos-alvo

- `src/pages/Review.tsx`
- `src/data/reviewData.ts`
- `src/pages/Content.tsx`
- `src/components/layout/TopNav.tsx`

### Tarefas

- criar página de revisão rápida;
- criar glossário navegável;
- criar mapa de teoremas;
- criar checklists por tópico;
- criar tabela de equivalências;
- criar modo de consulta por símbolo e termo formal.

### Critério de aceite

- o aluno consegue revisar rapidamente antes de prova;
- o site serve como consulta de definição e teorema;
- há caminhos de entrada para estudo longo e revisão curta.

## Fase 6. Consolidação de qualidade

### Objetivo

Tratar conteúdo e produto com o mesmo rigor da engine.

### Tarefas

- revisar coerência conceitual entre teoria e exercício;
- testar rendering das novas estruturas de conteúdo;
- ampliar testes para gramática e exercício;
- criar checklist editorial.

### Checklist editorial mínimo

- definição formal correta;
- intuição separada da definição;
- exemplo resolvido;
- erro comum;
- resumo;
- referência bibliográfica;
- exercício associado;
- integração com simulador quando aplicável.

## Ordem prática recomendada de implementação

### Sprint 1

- home;
- navegação;
- correções editoriais;
- bibliografia central;
- tipos enriquecidos.

### Sprint 2

- módulos 0 a 3;
- novo cabeçalho de lição;
- busca por corpo de conteúdo.

### Sprint 3

- módulos 4 e 5;
- novo modelo de exercício;
- solução guiada para AFD, AFN e ER.

### Sprint 4

- GLC, AP e bombeamento;
- melhorias em gramática;
- exercícios guiados desses módulos.

### Sprint 5

- Turing, decidibilidade e hierarquia;
- revisão rápida;
- acabamento editorial final.

## Definição final de pronto

O projeto só pode ser considerado reestruturado quando:

1. A identidade de produto estiver desacoplada de turma e semestre.
2. A trilha central estiver consistente e completa.
3. Exercícios forem pedagógicos, não apenas verificadores.
4. Os módulos avançados não estiverem comprimidos em blocos superficiais.
5. O produto funcionar tanto para aprender quanto para revisar.
6. O conteúdo tiver rastreabilidade, consistência e maturidade editorial.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] A base técnica já foi suficientemente modularizada para permitir execução incremental das fases sem reescrever a aplicação do zero.
- [x] O produto já tem infraestrutura de rota, progresso, lazy loading e testes para sustentar uma implementação em fases.

### Parcial

- [ ] A fase `0` já teve modernização visual e reorganização de componentes, mas a higiene editorial e o reposicionamento ainda não foram concluídos.
- [ ] A fase `2` está parcialmente adiantada porque os módulos `0` a `5` já existem e os módulos `0` a `3` são os mais robustos, mas ainda há lacunas conceituais e editoriais.
- [ ] A fase `3` está parcialmente adiantada porque já existe verificação automática e modal de resolução, mas falta a camada de solução guiada.
- [ ] A fase `4` está parcialmente adiantada porque os módulos avançados existem, mas continuam comprimidos e sem a divisão proposta.
- [ ] A fase `6` está parcialmente adiantada porque já existem testes e guardrails técnicos, mas ainda não existe checklist editorial operacionalizado no conteúdo.

### Não feito

- [ ] A fase `1` ainda não foi implementada: não há enriquecimento de `Lesson`/`ContentBlock`, bibliografia central ou índice de conteúdo.
- [ ] A fase `5` ainda não foi implementada: não há `Review.tsx`, `reviewData.ts`, glossário navegável ou mapa de teoremas como superfície dedicada.
- [ ] O desdobramento em sprints deste roadmap ainda não aparece executado nem rastreado dentro do repositório.
- [ ] A definição final de pronto deste documento ainda não foi atingida.
