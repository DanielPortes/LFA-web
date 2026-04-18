# Refatorações Estruturais e Técnicas

## Objetivo deste documento

Este documento define as mudanças estruturais necessárias para sustentar a nova camada pedagógica do produto. A premissa é simples:

o problema do projeto não é falta de interface, e sim falta de modelo de informação pedagógica suficientemente rico.

## 1. Reposicionar a navegação principal

### Onde está o problema

- `src/components/layout/TopNav.tsx`
- `src/pages/Home.tsx`
- `src/pages/Content.tsx:434`

### Problema

A navegação atual funciona para um app com quatro áreas:

- `Início`
- `Material`
- `Exercícios`
- `Simulador`

Isso é funcional, mas ainda separa demais estudo, prática e exploração. Para uma referência forte, o aluno precisa sentir que está percorrendo uma trilha, não trocando de "modo" o tempo todo.

### Como deve ser

A navegação principal deve comunicar o produto como plataforma de estudo:

- `Trilha`
- `Exercícios`
- `Simulador`
- `Revisão`

Opcionalmente:

- `Referências`

### Mudança recomendada

Em `TopNav.tsx`, trocar o conceito de `Material` por `Trilha`. O nome `conteudo` pode permanecer internamente no estado de rota, mas a interface deve refletir a experiência pedagógica.

### Copy recomendada

- `Trilha`
  `Estude os tópicos em ordem, com pré-requisitos, teoria e exemplos.`

- `Exercícios`
  `Pratique com pistas, verificação e soluções guiadas.`

- `Simulador`
  `Construa, teste e compare modelos formais.`

- `Revisão`
  `Acesse definições, teoremas, checklists e erros frequentes.`

## 2. A home precisa deixar de ser agenda de turma e virar mapa de produto

### Onde está o problema

- `src/pages/Home.tsx:5-15`
- `src/pages/Home.tsx:27`
- `src/pages/Home.tsx:66`

### Como deve ser a nova home

A nova home deve ter cinco zonas:

1. Hero de valor.
2. Três modos de entrada.
3. Mapa da disciplina.
4. Continuação do progresso.
5. Recursos de revisão.

### Estrutura proposta

#### Zona 1: Hero

Título:

`Linguagens Formais e Autômatos, do conceito à resolução.`

Subtítulo:

`Aprenda definições formais, visualize execuções, pratique com feedback e revise o conteúdo central de LFA em um único ambiente.`

CTAs:

- `Começar pela trilha`
- `Abrir simulador`
- `Continuar meus estudos`

#### Zona 2: Entradas por perfil

- `Estou começando`
  Leva para módulo 0.

- `Quero praticar`
  Leva para exercícios por assunto.

- `Quero revisar rápido`
  Leva para página de revisão futura.

#### Zona 3: Mapa da disciplina

Cards de módulos agrupados por macroeixo:

- Bases matemáticas e linguagem formal
- Linguagens regulares
- Gramáticas e pilha
- Computabilidade e decidibilidade
- Tópicos complementares

#### Zona 4: Progresso

Mostrar:

- última lição visitada;
- exercícios concluídos;
- módulo atual;
- tempo estimado restante do módulo.

#### Zona 5: Recursos rápidos

- glossário;
- lista de teoremas;
- checklist de prova;
- tabela de equivalências;
- tabela de formas normais.

## 3. O modelo de dados de conteúdo está pobre para fins pedagógicos

### Onde está o problema

- `src/types.ts`
- `src/data/theoryData.ts`
- `src/pages/Content.tsx`

### Problema

Hoje `Lesson` e `ContentBlock` são suficientes para renderizar conteúdo, mas não para operar um sistema de aprendizagem. Faltam metadados críticos.

### O que precisa existir

Cada lição deve carregar:

- objetivos;
- pré-requisitos;
- palavras-chave;
- estimativa de estudo;
- erros comuns;
- referências bibliográficas;
- relação com exercícios;
- status editorial.

### Estrutura recomendada

Adicionar em `src/types.ts` algo próximo disto:

```ts
export interface LessonReference {
    id: string;
    label: string;
    kind: 'book' | 'chapter' | 'article' | 'note';
    citation: string;
    locator?: string;
}

export interface CommonMistake {
    title: string;
    explanation: string;
    correction: string;
}

export interface LessonObjective {
    id: string;
    text: string;
}

export interface LessonSummaryPoint {
    id: string;
    text: string;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    objectives: LessonObjective[];
    prerequisites: string[];
    keywords: string[];
    estimatedMinutes: number;
    references: LessonReference[];
    commonMistakes: CommonMistake[];
    summary: LessonSummaryPoint[];
    exerciseRefs?: string[];
    content: ContentBlock[];
    status?: 'draft' | 'reviewed' | 'canonical';
}
```

### Por que isso é obrigatório

Sem esse nível de modelagem:

- a busca não pode ser boa;
- a revisão não pode ser boa;
- a trilha não pode ser inteligente;
- o conteúdo não pode ser auditável.

## 4. O tipo de bloco de conteúdo precisa crescer

### Onde está o problema

- `src/types.ts`
- `src/pages/Content.tsx`

### Problema

Os blocos atuais cobrem:

- texto;
- definição;
- teorema;
- exemplo;
- lista;
- nota;
- algoritmo;
- aviso;
- math-tip;
- interactive-grammar.

Isso é bom, mas ainda insuficiente para uma plataforma iterativa completa.

### Blocos que precisam ser adicionados

```ts
type ContentBlockTypeValue =
    | 'text'
    | 'definition'
    | 'theorem'
    | 'example'
    | 'list'
    | 'note'
    | 'algorithm'
    | 'warning'
    | 'math-tip'
    | 'interactive-grammar'
    | 'comparison'
    | 'proof-outline'
    | 'common-mistake'
    | 'checkpoint'
    | 'mini-exercise'
    | 'exercise-solution-step'
    | 'reference'
    | 'summary';
```

### O que cada novo bloco resolve

- `comparison`
  Comparar dois modelos, duas definições, dois algoritmos.

- `proof-outline`
  Explicar a estrutura de uma prova sem colapsar tudo em texto corrido.

- `common-mistake`
  Destacar confusões recorrentes do aluno.

- `checkpoint`
  Forçar pequena síntese antes da próxima seção.

- `mini-exercise`
  Colocar prática dentro da lição.

- `exercise-solution-step`
  Reaproveitar solução guiada em lições e revisão.

- `reference`
  Exibir bibliografia de forma visível no contexto.

- `summary`
  Fechar a lição com os 3 a 5 pontos que o aluno não pode esquecer.

## 5. A busca precisa ser reimplementada como índice de conteúdo, não filtro de lista

### Onde está o problema

- `src/pages/Content.tsx:304-312`

### Problema

Hoje a busca compara apenas `title` e `description`.

### Como deve ser

Criar um índice derivado do corpus.

### Estrutura recomendada

Criar `src/data/contentIndex.ts` com um builder:

```ts
export interface SearchEntry {
    lessonId: string;
    moduleId: string;
    moduleTitle: string;
    lessonTitle: string;
    terms: string[];
    excerpt: string;
    tags: string[];
}
```

### Campos que devem entrar em `terms`

- título do módulo;
- título da lição;
- descrição;
- objetivos;
- resumo;
- conteúdo textual de todos os blocos;
- palavras-chave;
- sinônimos e siglas:
  - `AFNε`, `AFN-e`, `AFN com epsilon`, `epsilon-closure`, `ε-fecho`;
  - `CNF`, `Forma Normal de Chomsky`;
  - `GNF`, `Forma Normal de Greibach`;
  - `Myhill-Nerode`, `Nerode`;
  - `Lema do Bombeamento`, `Pumping Lemma`.

### UX esperada

A busca deve retornar:

- lições;
- blocos relevantes dentro da lição;
- atalhos para exercícios do mesmo assunto;
- atalhos para abrir o simulador com template relacionado.

## 6. O conteúdo precisa declarar bibliografia e origem

### Onde está o problema

- menções pontuais a `Blauth` sem sistema de referências em `src/data/theory/modules/*`

### Como deve ser

Criar `src/data/bibliography.ts`:

```ts
export interface BibliographyEntry {
    id: string;
    shortLabel: string;
    fullCitation: string;
    note?: string;
}

export const bibliography: BibliographyEntry[] = [
    {
        id: 'blauth',
        shortLabel: 'Menezes',
        fullCitation: 'MENEZES, Paulo Blauth. Linguagens Formais e Autômatos.',
        note: 'Fonte-base principal do curso.'
    }
];
```

### Regra editorial

Toda lição deve declarar ao menos:

- fonte-base;
- escopo da adaptação;
- relação com outros módulos.

## 7. É preciso integrar conteúdo, exercício e simulador no próprio modelo

### Onde está o problema

- `src/pages/Content.tsx`
- `src/pages/Exercises.tsx`
- `src/pages/Simulator.tsx`

### Problema

Hoje existe integração na interface, mas não no dado. A lição não sabe formalmente quais exercícios a consolidam. O exercício não sabe claramente qual lição o antecede. O simulador não sabe quais templates são pedagógicos por assunto.

### Como deve ser

Cada módulo deve declarar:

- quais exercícios pertencem a quais lições;
- quais templates de simulador são exemplos canônicos;
- quais conceitos são pré-requisitos.

### Estrutura sugerida

```ts
export interface LessonExerciseLink {
    categoryId: string;
    exerciseId: number;
    purpose: 'warmup' | 'fixation' | 'challenge' | 'proof';
}

export interface LessonSimulatorLink {
    label: string;
    description: string;
    templateId?: string;
    automaton?: AutomatoData;
}
```

## 8. O módulo de conteúdo precisa ganhar uma camada pedagógica visível

### Onde está o problema

- `src/pages/Content.tsx`

### Como a tela deve mudar

Antes do corpo da lição, mostrar:

- objetivos da lição;
- o que o aluno precisa saber antes;
- tempo estimado;
- exercícios associados;
- referências;
- status de conclusão.

Depois do corpo da lição, mostrar:

- resumo;
- erros comuns;
- mini-checkpoint;
- próximos passos;
- botão para exercícios relacionados.

### Exemplo de cabeçalho ideal

```md
## Nesta lição você vai

- definir formalmente um AFD;
- distinguir comportamento determinístico de não determinístico;
- aplicar δ̂ em palavras curtas;
- reconhecer quando um AFD precisa de estado sumidouro.

## Pré-requisitos

- alfabeto, palavra e linguagem;
- noções básicas de função e conjunto.
```

## 9. O estado editorial do conteúdo precisa ser rastreável

### Problema

Hoje não existe diferença estrutural entre:

- conteúdo canônico;
- conteúdo rascunho;
- conteúdo ainda incompleto.

### Como deve ser

Adicionar `status` em cada lição:

- `draft`
- `reviewed`
- `canonical`

Adicionar também:

- `lastReviewedAt`
- `reviewedBy`

Mesmo que isso comece estático, ele cria disciplina editorial.

## 10. A home e a trilha precisam usar linguagem mais forte e mais objetiva

### Copy pronta para o topo da trilha

Substituir `Material P1` por:

`Trilha completa de LFA`

Subtítulo:

`Do alfabeto à decidibilidade, com teoria, visualização e prática guiada.`

### Copy pronta para busca

Placeholder atual:

`Buscar lição...`

Placeholder recomendado:

`Buscar conceito, teorema, algoritmo ou símbolo formal...`

## 11. O projeto precisa de uma página de revisão rápida

### Por que isso é necessário

Referência de estudo não é só curso longo. É também material de consulta.

### O que a página deve ter

- definições essenciais;
- teoremas-chave;
- checklists de construção;
- equivalências clássicas;
- tabela de linguagens-exemplo;
- erros comuns por tópico.

### Arquivos sugeridos

- `src/pages/Review.tsx`
- `src/data/reviewData.ts`

## 12. A camada técnica deve apoiar a camada pedagógica

### Tarefas técnicas objetivas

- Criar `src/data/bibliography.ts`.
- Criar `src/data/contentIndex.ts`.
- Expandir `Lesson` e `ContentBlock` em `src/types.ts`.
- Revisar `Content.tsx` para renderizar:
  - objetivos;
  - pré-requisitos;
  - referências;
  - erros comuns;
  - resumo.
- Criar vínculo entre lições e exercícios.
- Criar página de revisão.
- Adicionar índice de maturidade editorial.

## Definição de pronto deste eixo

Este eixo só está pronto quando:

1. A home não estiver mais presa a turma/semestre.
2. O conteúdo tiver objetivos, pré-requisitos, resumo, erros comuns e referências.
3. A busca indexar o corpo real do material.
4. Teoria, exercício e simulador estiverem vinculados pelo dado.
5. Houver uma camada explícita de revisão rápida e bibliografia.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] A área de conteúdo já foi modularizada em componentes e hooks como `ContentSidebar`, `LessonHeader`, `LessonContent`, `LessonNavigator`, `useCourseModulesData` e `useContentSelection`.
- [x] A experiência atual já oferece progresso, última lição visitada, preview de autômatos e navegação entre lições.
- [x] Já existe integração funcional com o simulador por `onSimulate`, estado de rota e compartilhamento de autômatos.

### Parcial

- [ ] A home já mostra uma jornada da disciplina e entrada para o simulador, mas ainda funciona parcialmente como página de turma.
- [ ] O módulo de conteúdo já tem camada de navegação e progresso, mas não exibe objetivos, pré-requisitos, referências, erros comuns ou resumo.
- [ ] A integração entre teoria, exercícios e simulador já existe na interface, mas ainda não foi formalizada no modelo de dados.
- [ ] A base técnica foi refatorada para suportar expansão, porém ainda não recebeu a camada pedagógica proposta neste documento.

### Não feito

- [ ] `TopNav.tsx` ainda usa `Material` em vez de `Trilha`, e ainda não existe a entrada `Revisão`.
- [ ] `Lesson` e `ContentBlock` em `src/types.ts` ainda não possuem objetivos, palavras-chave, referências, erros comuns, resumo ou status editorial.
- [ ] Os novos tipos de bloco propostos (`comparison`, `proof-outline`, `common-mistake`, `checkpoint`, `mini-exercise`, `summary` e outros) ainda não foram adicionados.
- [ ] `src/data/contentIndex.ts` não existe, e a busca segue sem índice textual real.
- [ ] `src/data/bibliography.ts` não existe.
- [ ] Ainda não há rastreabilidade editorial com `draft`, `reviewed`, `canonical`, `lastReviewedAt` e `reviewedBy`.
- [ ] `src/pages/Review.tsx` e `src/data/reviewData.ts` ainda não existem.
- [ ] A cópia principal ainda mantém `Material P1` e o placeholder `Buscar lição...`.
