# Plano de Exercícios, Feedback e Soluções Guiadas

## Objetivo

Este documento define como transformar o sistema atual de exercícios em uma camada pedagógica robusta.

Hoje o projeto já tem:

- categorias variadas;
- verificação automática em parte dos exercícios;
- traço de execução;
- hints;
- resposta textual;
- abertura do simulador.

Isso é uma boa base. O problema é que ainda não existe uma arquitetura explícita de progressão de dificuldade, diagnóstico de erro e solução guiada.

## 1. Diagnóstico do estado atual

### Onde está o problema

- `src/pages/Exercises.tsx:785-807`
- `src/pages/Exercises.tsx:820-845`
- `src/pages/Exercises.tsx:1134-1224`
- `src/data/constants.ts`

### O que já funciona

- botão para tentar resolver;
- dica opcional;
- resposta revelável;
- verificação automatizada em parte dos casos;
- contraexemplo inicial via `Primeiro erro`;
- traço de execução em casos aplicáveis;
- equivalência para alguns AFDs.

### O que ainda está faltando

- solução em etapas;
- vínculo explícito com a teoria;
- classificação pedagógica por objetivo;
- múltiplas pistas graduais;
- explicação do erro conceitual;
- catálogo de padrões de exercício;
- separação entre gabarito final e resolução guiada.

## 2. O problema pedagógico do modelo atual

### Fluxo atual predominante

1. Ler enunciado.
2. Tentar resolver.
3. Pedir dica.
4. Verificar.
5. Ver resposta.

### Limitação

Esse fluxo é melhor que nada, mas ainda produz o salto:

`não sei` -> `olhei o gabarito`

quando o fluxo desejado deveria ser:

`não sei` -> `entendi a estratégia` -> `avancei uma etapa` -> `corrigi meu erro` -> `agora consigo resolver sozinho`

## 3. Novo modelo de dados para exercícios

### Arquivo a evoluir

- `src/types.ts`

### Estrutura recomendada

```ts
export interface ExerciseHint {
    id: string;
    level: 1 | 2 | 3;
    text: string;
}

export interface ExerciseCommonMistake {
    id: string;
    title: string;
    symptom: string;
    correction: string;
}

export interface GuidedSolutionStep {
    id: string;
    title: string;
    explanation: string;
    expectedStudentAction?: string;
    checkpointQuestion?: string;
    automatonSnapshot?: AutomatoData;
    grammarSnapshot?: string;
}

export interface ExerciseMetadata {
    learningGoal: string;
    pattern:
        | 'construction'
        | 'simulation'
        | 'conversion'
        | 'proof'
        | 'debugging'
        | 'classification';
    prerequisites: string[];
    theoryRefs: string[];
}

export interface Exercicio {
    id: number;
    pergunta: string;
    dica?: string;
    dicas?: ExerciseHint[];
    respostaTexto?: string;
    respostaAutomato?: AutomatoData;
    guidedSolution?: GuidedSolutionStep[];
    commonMistakes?: ExerciseCommonMistake[];
    metadata?: ExerciseMetadata;
    testes?: TestCase[];
    nivel: ExerciseLevelType;
    mode?: ExerciseModeType;
    tipo?: AutomatoTipo;
}
```

## 4. Nova estrutura da interface de exercício

### Arquivo a evoluir

- `src/pages/Exercises.tsx`

### Como a UI deve ser organizada

Cada exercício deve ter as seguintes abas ou seções expansíveis:

1. `Enunciado`
2. `Pistas`
3. `Estratégia`
4. `Resolver`
5. `Feedback`
6. `Solução guiada`
7. `Gabarito final`
8. `Erros comuns`

### Diferença conceitual entre seções

- `Pistas`
  pequenas ajudas graduais.

- `Estratégia`
  explica o plano de ataque antes da resposta.

- `Solução guiada`
  mostra a resolução em etapas, com justificativa.

- `Gabarito final`
  mostra o produto final compacto.

Hoje `Ver Resposta` mistura as três últimas coisas.

## 5. Tipos de exercício que a plataforma deve cobrir

Para cada módulo importante, é necessário ter pelo menos estes tipos:

### Tipo A — Reconhecimento

O aluno decide se uma palavra pertence à linguagem.

### Tipo B — Construção

O aluno constrói autômato, gramática ou ER.

### Tipo C — Conversão

O aluno transforma uma representação em outra.

### Tipo D — Debugging

O aluno corrige um modelo errado.

### Tipo E — Classificação

O aluno identifica a classe da linguagem ou a propriedade correta.

### Tipo F — Prova

O aluno argumenta formalmente:

- fechamento;
- decidibilidade;
- não regularidade;
- equivalência;
- ambiguidade.

## 6. Distribuição mínima recomendada por módulo

### Módulos 0 a 5

- `6` exercícios de aquecimento por módulo;
- `8` exercícios principais;
- `3` exercícios de debugging;
- `2` exercícios de prova curta.

### GLC e AP

- `5` exercícios de derivação;
- `5` de construção;
- `3` de ambiguidade ou equivalência;
- `3` de traço de execução.

### Computabilidade

- `4` exercícios conceituais;
- `4` exercícios de classificação;
- `4` exercícios de redução;
- `3` exercícios de decisão versus reconhecimento.

## 7. Como deve funcionar o feedback automático

### Situação atual

O painel já mostra:

- primeiro erro;
- traço;
- equivalência para alguns casos.

### Evolução necessária

O feedback deve ser associado ao tipo de exercício.

### Para construção de AFD/AFN/AP

Mostrar:

- se a linguagem está correta nos testes;
- se há estados inalcançáveis;
- se falta totalização quando ela for exigida;
- contraexemplo mínimo quando houver diferença de linguagem;
- sugestão do padrão de construção provável:
  - prefixo;
  - sufixo;
  - módulo;
  - contagem por pilha.

### Para gramáticas

Mostrar:

- falha de parse;
- símbolo inacessível;
- não terminação dentro do limite;
- árvore parcial, quando existir;
- palavra testemunha que não foi gerada ou foi gerada incorretamente.

### Para provas

Não tentar "corrigir semanticamente" tudo. Em vez disso:

- pedir estrutura mínima da prova;
- oferecer checklist;
- revelar solução por camadas.

## 8. Exercícios de prova precisam de um modo próprio

### Problema

O tipo `text` atual é útil, mas fraco para disciplinas formais.

### Como deve ser

Adicionar um subtipo de exercício discursivo estruturado:

```ts
type TextExerciseMode = 'free_text' | 'proof_outline' | 'classification_matrix';
```

### Exemplo de `proof_outline`

O exercício entrega campos:

- hipótese;
- estratégia escolhida;
- construção ou palavra-testemunha;
- passo crítico;
- conclusão.

Isso força o aluno a raciocinar na estrutura correta.

## 9. Solução guiada: modelo exato

### Exemplo de exercício

`Construa um AFD para L = { w ∈ {0,1}* | w termina em 01 }`

### Como deve ser a solução guiada

#### Etapa 1 — Identificar a memória necessária

Texto:

`A linguagem depende apenas do sufixo relevante mais recente. Não precisamos memorizar a palavra inteira, apenas o quanto do padrão final "01" já está alinhado com o sufixo lido até agora.`

Checkpoint:

`Quais sufixos parciais de "01" podem aparecer como memória útil?`

#### Etapa 2 — Propor estados

Texto:

`Use um estado para "nada relevante alinhado", um para "o último símbolo lido foi 0" e um para "o sufixo atual termina em 01".`

#### Etapa 3 — Completar transições

Texto:

`Ao ler 0 depois de qualquer situação, você atualiza o sufixo útil para "0". Ao ler 1 a partir do estado que representa "0", você completa o padrão "01".`

#### Etapa 4 — Marcar aceitação

Texto:

`O estado final deve ser aquele em que o sufixo útil já é exatamente "01" ao final da leitura.`

#### Etapa 5 — Validar com palavras curtas

Palavras:

- `01`
- `101`
- `001`
- `0`
- `10`

### Gabarito final

Só depois das etapas acima deve aparecer o autômato consolidado.

## 10. Modelo de erro comum por exercício

### Exemplo para AFD de sufixo

Título:

`Marcar como final o estado "vi 0"`

Sintoma:

`O autômato passa a aceitar palavras terminadas em 0, não apenas em 01.`

Correção:

`O estado final não representa "estou perto", e sim "o padrão completo foi satisfeito ao final da leitura".`

## 11. Exercícios de lema do bombeamento precisam de roteiro formal

### Exemplo de solução guiada obrigatória

Enunciado:

`Mostre que L = { a^n b^n | n >= 0 } não é regular.`

### Etapas da solução

#### Etapa 1 — Assuma a hipótese contrária

`Suponha que L seja regular. Então existe um comprimento de bombeamento p fornecido pelo lema.`

#### Etapa 2 — Escolha a palavra

`Escolha w = a^p b^p. Essa palavra está em L e tem comprimento pelo menos p.`

#### Etapa 3 — Analise qualquer decomposição válida

`Como |xy| <= p, tanto x quanto y contêm apenas símbolos a. Portanto, y = a^k para algum k > 0.`

#### Etapa 4 — Bombeie

`Tomando i = 0, obtemos xz = a^(p-k) b^p, que não pertence a L.`

#### Etapa 5 — Conclua

`Obtivemos contradição com o lema. Logo, L não é regular.`

### Erro comum obrigatório

`Escolher você mesmo a decomposição específica y = a sem justificar que toda decomposição válida fica dentro do bloco de a's.`

## 12. Exercícios de GLC e AP precisam explorar traço, não só resposta final

### Onde isso importa

- derivação;
- árvore;
- pilha;
- mudança de fase em AP.

### Exercício recomendado

`Dada a gramática S -> aSb | ε, derive aabb à esquerda e à direita e compare as formas sentenciais intermediárias.`

### Solução guiada deve mostrar

- passo 0: `S`
- passo 1
- passo 2
- passo 3
- palavra final
- árvore correspondente

## 13. Exercícios de debugging precisam virar categoria de primeira classe

### Por que isso importa

O aluno aprende muito ao corrigir um modelo quase certo.

### Tipos obrigatórios

- autômato com final errado;
- transição faltante;
- gramática que gera linguagem maior;
- AFD minimizado incorretamente;
- uso incorreto de complemento sem totalização.

### Exemplo de enunciado

`O autômato abaixo deveria reconhecer binários terminados em 01, mas aceita 0011. Identifique o erro conceitual e corrija o modelo.`

## 14. Banco de exercícios deve declarar vínculo pedagógico

### Onde mudar

- `src/data/constants.ts`

### Cada exercício deve declarar

- objetivo de aprendizagem;
- lição associada;
- padrão cognitivo;
- dificuldade real;
- modo de correção;
- se é obrigatório, recomendado ou desafio.

### Exemplo

```ts
metadata: {
    learningGoal: 'Construir AFD por sufixo relevante',
    pattern: 'construction',
    prerequisites: ['l1-def', 'l1-delta', 'l1-projeto'],
    theoryRefs: ['mod1', 'l1-projeto']
}
```

## 15. Critério de pronto do eixo de exercícios

Este eixo só está pronto quando:

1. `Ver resposta` deixar de ser a única forma de "solução".
2. Exercícios centrais tiverem `dicas`, `estratégia`, `solução guiada` e `erros comuns`.
3. Houver banco de debugging e de prova.
4. Cada exercício estiver ligado a objetivos de aprendizagem.
5. O feedback variar conforme o tipo do exercício.
6. O aluno conseguir aprender mesmo após errar, sem depender do gabarito final.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] A experiência atual já oferece botão para resolver, modal de edição, dica única, revelação de resposta e verificação automática em parte relevante do banco.
- [x] O feedback atual já inclui primeiro erro, traço de execução, equivalência entre AFDs em alguns casos e árvore/avisos de gramática.
- [x] O banco atual já cobre `90` exercícios distribuídos por fundamentos, AFD, AFN, ER, gramáticas, AP, pumping, Turing e transdutores.

### Parcial

- [ ] A UI já separa área de resolução e painel de verificação, mas ainda mistura estratégia, solução guiada e gabarito final em `Ver Resposta`.
- [ ] O feedback já varia por modo (`automaton`, `regex`, `grammar`, `text`), mas ainda não varia por padrão pedagógico como construção, prova, debugging ou classificação.
- [ ] Exercícios discursivos já podem ser respondidos e marcados como concluídos, mas ainda sem estrutura de prova guiada.
- [ ] A busca atual já considera pergunta, dica e resposta textual, porém ainda sem metadados pedagógicos, teoria associada ou pré-requisitos.

### Não feito

- [ ] `Exercicio` em `src/types.ts` ainda não possui `dicas[]`, `guidedSolution`, `commonMistakes`, `metadata`, `learningGoal` ou `theoryRefs`.
- [ ] Ainda não existe uma seção própria de `Estratégia`, `Solução guiada`, `Erros comuns` ou pistas graduais por nível.
- [ ] Exercícios de debugging e de prova ainda não são categorias pedagógicas de primeira classe no modelo de dados.
- [ ] O banco ainda não declara vínculo formal entre exercício, lição, objetivo de aprendizagem e padrão cognitivo.
- [ ] O critério de pronto deste documento ainda não foi atingido.
