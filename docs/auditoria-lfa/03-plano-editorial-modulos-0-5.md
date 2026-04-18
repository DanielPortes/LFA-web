# Plano Editorial Detalhado dos Módulos 0 a 5

## Objetivo

Este documento cobre a reconstrução dos módulos centrais da trilha:

- fundamentos;
- AFD;
- AFN e AFN-ε;
- ER;
- minimização;
- propriedades das linguagens regulares.

O foco aqui não é apenas dizer "precisa aprofundar". O foco é dizer exatamente o que precisa existir e qual conteúdo deve ser inserido.

## Módulo 0. Fundamentos

### Arquivo atual

- `src/data/theory/modules/mod0_fundamentos.ts`

### Estado atual

O módulo já tem boa base relativa, mas ainda opera como introdução expandida, não como alicerce formal fechado.

### O que falta

- separar melhor linguagem informal de definição formal;
- dar mais densidade à noção de palavra, comprimento, potência e concatenação;
- incluir mais exemplos curtos de leitura de notação;
- colocar erros comuns explícitos;
- adicionar mini-exercícios no meio da lição.

### Estrutura desejada

#### Lição 0.1 — Alfabetos, palavras e linguagens

Deve manter o que já existe, mas ganhar:

- um bloco `common-mistake` sobre `ε`, `{ε}` e `∅`;
- um bloco `checkpoint` com três perguntas rápidas;
- um bloco `summary`.

#### Conteúdo pronto para inserir

##### Erro comum

Título:

`Não confunda ε, {ε} e ∅`

Texto:

`ε é uma palavra. {ε} é uma linguagem que contém uma única palavra, a palavra vazia. ∅ é a linguagem sem palavras. Em provas, essa distinção aparece o tempo todo em fecho, concatenação e equivalência de linguagens.`

##### Checkpoint

- `Σ pode ser vazio?`
- `Uma linguagem pode ser infinita mesmo com alfabeto finito?`
- `Por que {ε} ≠ ∅?`

#### Lição 0.2 — Operações sobre palavras

Nova lição obrigatória.

### Conteúdo que deve existir

- comprimento `|w|`;
- reverso `w^R`;
- concatenação;
- potência `w^n`;
- prefixo, sufixo e subpalavra;
- exemplos curtos com cálculo manual.

### Texto-base recomendado

`Se w = abba, então |w| = 4, w^R = abba, seus prefixos são ε, a, ab, abb e abba, e seus sufixos são ε, a, ba, bba e abba. Essa leitura operacional da palavra será reutilizada na definição de transição estendida, em derivação e em provas por indução.`

#### Lição 0.3 — Operações sobre linguagens

Expandir a lição já existente com:

- diferença entre operação sobre palavra e sobre linguagem;
- distributividade;
- não comutatividade da concatenação;
- exemplos de quando `L1L2 ≠ L2L1`.

### Mini-exercício obrigatório

`Se L1 = {a, ab} e L2 = {b}, calcule L1L2 e L2L1. Explique por que os resultados diferem.`

#### Lição 0.4 — Leitura de notação formal

Nova lição.

### Conteúdo que deve existir

- como ler `L = { w ∈ Σ* | ... }`;
- como ler `δ: Q × Σ → Q`;
- como ler `2^Q`;
- como ler `S ⇒* w`;
- como ler `A ≤m B`.

### Por que essa lição é necessária

O aluno de LFA frequentemente não erra o conceito, erra a leitura da notação. Uma referência forte precisa ensinar essa leitura explicitamente.

#### Lição 0.5 — Técnicas de prova em LFA

Expandir a lição atual com exemplos concretos:

- prova direta com linguagem finita;
- contraposição com fechamento;
- absurdo com linguagem não regular;
- indução em `|w|` ou em número de derivações.

### Texto-base recomendado

`Em LFA, indução aparece em dois lugares com frequência: na prova sobre o comprimento das palavras e na prova sobre o número de passos de uma derivação. O erro clássico é tentar induzir sobre a linguagem inteira, quando a propriedade correta depende da estrutura de uma palavra ou de uma derivação específica.`

## Módulo 1. AFD

### Arquivo atual

- `src/data/theory/modules/mod1_afd.ts`

### Problema central

O módulo é bom visualmente, mas ainda precisa ser mais formal e mais cuidadoso na definição.

### Correção conceitual obrigatória

#### Onde

- `src/data/theory/modules/mod1_afd.ts:20`

#### O que corrigir

Trocar a definição ambígua atual por uma destas duas formulações:

##### Formulação recomendada

`Um AFD é uma 5-upla M = (Σ, Q, δ, q0, F), em que δ: Q × Σ → Q é total. Se um diagrama omite uma transição, isso deve ser interpretado como simplificação visual; formalmente, a máquina pode ser completada com um estado sumidouro.`

##### Observação didática logo abaixo

`Nesta plataforma, alguns exemplos podem aparecer sem o estado sumidouro desenhado para reduzir ruído visual. Quando for necessário provar complemento, decidir propriedades ou minimizar o AFD, a versão totalizada deve ser usada.`

### Novas lições necessárias

#### Lição 1.1 — Definição formal e semântica operacional

Deve conter:

- definição formal correta;
- papel de cada componente;
- interpretação operacional de `δ`;
- o que significa "determinístico".

#### Lição 1.2 — Função de transição estendida

Deve conter:

- definição de `δ̂`;
- cálculo passo a passo;
- visualização com palavra curta;
- mini-exercício dentro da lição.

### Conteúdo pronto

`A função estendida δ̂ não é um novo mecanismo do autômato; ela é apenas a formalização da ideia de processar uma palavra inteira símbolo por símbolo. Em vez de perguntar "para onde vou com um símbolo?", perguntamos "em que estado termino depois de consumir toda a palavra?".`

#### Lição 1.3 — Padrões de construção

Já existe uma base, mas precisa ganhar:

- estados como memória mínima;
- exemplos por classe:
  - prefixo;
  - sufixo;
  - paridade;
  - resto modular;
  - detecção de substring.

#### Lição 1.4 — Estado sumidouro e totalização

Já existe o tema, mas precisa ganhar:

- diferença entre diagrama simplificado e definição formal;
- por que complemento exige totalização;
- exemplo completo antes/depois.

#### Lição 1.5 — Operações com AFD

Nova lição obrigatória.

### Conteúdo que deve existir

- produto cartesiano;
- união;
- interseção;
- complemento;
- diferença.

### Texto-base recomendado

`A construção produto não é um truque isolado, e sim a ideia de executar duas máquinas ao mesmo tempo. Cada estado do produto registra simultaneamente o estado atual do primeiro AFD e do segundo. A partir daí, basta mudar a condição de aceitação para obter união, interseção ou diferença.`

#### Lição 1.6 — Debugging de AFD

Nova lição curta, prática.

### Objetivo

Ensinar o aluno a identificar:

- estado inicial errado;
- final faltando;
- transição faltando;
- alfabeto incompleto;
- estado inalcançável.

## Módulo 2. AFN e AFN-ε

### Arquivo atual

- `src/data/theory/modules/mod2_afn.ts`

### O que precisa ser garantido

O módulo deve separar nitidamente:

- AFN sem ε;
- AFN com ε;
- intuição operacional;
- semântica de aceitação;
- conversão para AFD.

### Lições obrigatórias

#### Lição 2.1 — O que é não determinismo

O texto deve deixar explícito:

- não determinismo não é aleatoriedade;
- o AFN aceita se existir ao menos um caminho aceito;
- caminhos mortos não invalidam a aceitação se outro caminho aceita.

#### Texto-base

`Em um AFN, a máquina não precisa "escolher corretamente" um único caminho. A definição de aceitação pergunta apenas se existe pelo menos uma computação compatível com a entrada que termina em estado final.`

#### Lição 2.2 — Semântica em conjunto de estados

Conteúdo obrigatório:

- `δ: Q × Σ → 2^Q`;
- por que `2^Q` aparece;
- simulação por conjunto de estados ativos.

#### Lição 2.3 — ε-fecho

Conteúdo obrigatório:

- definição de ε-transição;
- definição de ε-fecho;
- algoritmo de cálculo;
- exemplo desenhado e executado.

### Algoritmo pronto para inserir

1. Inicie o conjunto com o estado de partida.
2. Enquanto houver estado com transição ε para fora do conjunto, adicione o destino.
3. Pare quando nenhum novo estado puder ser alcançado por ε.

#### Lição 2.4 — Conversão AFN/AFN-ε → AFD

Conteúdo obrigatório:

- construção dos subconjuntos;
- estado inicial como ε-fecho do inicial;
- quando um estado do AFD é final;
- interpretação dos nomes dos conjuntos.

### Erro comum obrigatório

Título:

`Achar que o AFD "simula um caminho só"`

Correção:

`Cada estado do AFD resultante representa um conjunto de possibilidades do AFN original. O determinismo reaparece no modelo convertido, mas a informação sobre múltiplos caminhos continua codificada no subconjunto.`

## Módulo 3. Expressões Regulares

### Arquivo atual

- `src/data/theory/modules/mod3_er.ts`

### O que falta

- exemplos mais difíceis de leitura;
- ligação clara com construção de linguagem;
- identidade algébrica usada em simplificação;
- mais material sobre eliminação de estados.

### Lições obrigatórias

#### Lição 3.1 — Sintaxe, precedência e leitura

Manter e aprofundar:

- ordem de precedência;
- concatenação implícita;
- uso de parênteses;
- exemplos ambíguos para o iniciante.

#### Lição 3.2 — Construção de linguagem por ER

Nova lição.

### Texto-base

`Ler uma ER corretamente é traduzir operadores em famílias de palavras. A expressão (a+b)*abb não "contém abb"; ela descreve todas as palavras sobre {a,b} cujo sufixo final é abb. O ponto não é reconhecer o desenho da ER, e sim entender o conjunto que ela denota.`

#### Lição 3.3 — Thompson

Já existe, mas deve ganhar:

- caso base para símbolo;
- concatenação explícita;
- união;
- fecho;
- custo da construção.

#### Lição 3.4 — Identidades e simplificação

Expandir com:

- neutralidade de `ε`;
- absorção por `∅`;
- idempotência de `*`;
- uso didático de simplificação, sem sugerir que toda ER tem "forma mais bonita" única.

#### Lição 3.5 — AFD para ER via eliminação de estados

Precisa ter ao menos um exemplo completo, não só o algoritmo geral.

### Conteúdo pronto

`Na eliminação de estados, o aluno deve acompanhar como um caminho indireto entre p e q vira um novo rótulo combinando concatenação, união e fecho. Sem um exemplo completo, a técnica parece puramente mecânica e opaca.`

## Módulo 4. Minimização

### Arquivo atual

- `src/data/theory/modules/mod4_minimizacao.ts`

### Estado atual

O módulo é curto demais para um tema central da disciplina.

### O que precisa existir

#### Lição 4.1 — Pré-requisitos de minimização

Já existe parcialmente, mas deve incluir:

- remoção de inacessíveis;
- totalização;
- justificativa de cada pré-requisito.

#### Lição 4.2 — Relação de indistinguibilidade

Nova lição obrigatória.

### Conteúdo pronto

`Dois estados p e q são equivalentes quando nenhuma palavra consegue distingui-los em termos de aceitação. Isto é: para toda palavra w, a execução iniciada em p sobre w aceita exatamente quando a execução iniciada em q sobre w aceita.`

#### Lição 4.3 — Tabela de marcação

O algoritmo atual deve ganhar:

- exemplo completo;
- propagação de marcação;
- interpretação intuitiva de um par marcado.

#### Lição 4.4 — Resultado mínimo e unicidade

Nova lição curta.

### Conteúdo que deve existir

- o AFD mínimo é único até isomorfismo;
- por que minimizar não muda a linguagem;
- ligação com equivalência de estados.

## Módulo 5. Propriedades das Linguagens Regulares

### Arquivo atual

- `src/data/theory/modules/mod5_propriedades.ts`

### O que precisa crescer

Este módulo deve funcionar como ponte entre:

- construção de modelos;
- prova de propriedades;
- limites da classe regular.

### Lições obrigatórias

#### Lição 5.1 — Fechamento com construção

Conteúdo:

- união;
- interseção;
- complemento;
- concatenação;
- estrela;
- reverso.

Não basta listar. É preciso dizer como provar.

#### Lição 5.2 — Problemas de decisão

Conteúdo:

- vazio;
- finitude;
- pertinência;
- equivalência;
- inclusão.

### Texto-base recomendado

`Dizer que uma classe é fechada por uma operação é afirmar que, dado um modelo da classe para cada operando, existe um procedimento efetivo para construir um novo modelo da mesma classe representando o resultado da operação.`

#### Lição 5.3 — Linguagem, modelo e algoritmo de decisão

Nova lição.

### Objetivo

Explicar ao aluno a diferença entre:

- reconhecer palavras;
- decidir propriedades de linguagens;
- transformar representações.

#### Lição 5.4 — Introdução ao Lema do Bombeamento

Se o lema não virar módulo próprio imediatamente, este módulo deve ao menos preparar o terreno.

### Conteúdo obrigatório

- intuição do laço em AFD;
- enunciado informal;
- para que serve;
- para que não serve.

### Erro comum obrigatório

Título:

`Usar o lema para provar que uma linguagem é regular`

Correção:

`O lema do bombeamento é condição necessária para regularidade, não critério suficiente. Ele é usado principalmente para provar não regularidade.`

## Checklist de pronto para os módulos 0 a 5

Cada módulo deste grupo só está pronto quando tiver:

- pelo menos `4` lições substantivas;
- ao menos `1` exemplo visual forte;
- ao menos `1` bloco de erro comum;
- ao menos `1` mini-exercício dentro da teoria;
- fechamento com resumo e referências;
- ligação explícita com exercícios.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] O módulo `0` já é o alicerce mais denso da trilha, com `6` lições cobrindo fundamentos, operações, lógica, representação e glossário.
- [x] O módulo `1` já tem `4` lições, exemplos visuais de AFD e cobertura explícita de `δ̂`, projeto e totalização.
- [x] Os módulos `2` e `3` já incluem conversões importantes e exemplos visuais com `automatoRef` e `automatoRef2`.

### Parcial

- [ ] O módulo `0` já cobre boa parte da base, mas ainda não organiza operações sobre palavras, leitura de notação, checkpoints, erros comuns e resumo na granularidade prevista.
- [ ] O módulo `1` cobre o fluxo central de AFD, mas ainda carece de lições próprias para operações com produto/complemento e debugging.
- [ ] O módulo `2` já cobre AFN, AFN-ε e determinização, porém ainda sem a densidade planejada para semântica em conjuntos de estados e erros comuns.
- [ ] O módulo `3` já cobre definição, Thompson, precedência e eliminação de estados, mas ainda sem o exemplo completo e a camada editorial rica descrita no plano.
- [ ] O módulo `5` já trata fechamento e lema do bombeamento regular/CFL, mas ainda mistura assuntos que o plano queria separar e aprofundar.

### Não feito

- [ ] O módulo `1` ainda mantém a formulação ambígua de AFD com `δ` parcial.
- [ ] O módulo `4` ainda tem apenas `2` lições e não cobre com a profundidade planejada indistinguibilidade, exemplo completo de marcação e unicidade do mínimo.
- [ ] Os módulos `0` a `5` ainda não usam metadados estruturados de objetivos, referências, erros comuns, mini-exercícios e resumos por lição.
- [ ] Ainda não há ligação formal entre lições e exercícios nesses módulos.
- [ ] O checklist de pronto deste documento ainda não é satisfeito por todo o grupo `0` a `5`.
