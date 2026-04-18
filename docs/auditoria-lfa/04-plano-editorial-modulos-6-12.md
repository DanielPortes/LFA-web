# Plano Editorial Detalhado dos Módulos 6 a 12

## Objetivo

Este documento cobre a parte mais frágil da trilha atual:

- gramáticas regulares;
- fechamentos e decisão;
- aplicações;
- Moore/Mealy;
- GLC;
- AP;
- Turing, ALL, decidibilidade e hierarquia.

Hoje esses temas aparecem no projeto, mas vários deles ainda não têm densidade suficiente para sustentar estudo completo.

## Problema estrutural deste trecho da trilha

### Onde isso aparece

- `src/data/theory/modules/mod6_gramaticas_regulares.ts`
- `src/data/theory/modules/mod7_fechamentos.ts`
- `src/data/theory/modules/mod8_aplicacoes.ts`
- `src/data/theory/modules/mod9_moore_mealy.ts`
- `src/data/theory/modules/mod10_glc.ts`
- `src/data/theory/modules/mod11_ap.ts`
- `src/data/theory/modules/mod12_chomsky.ts`

### Diagnóstico

Esta faixa da trilha mistura dois problemas:

1. módulos obrigatórios demais para o tamanho atual do conteúdo;
2. temas centrais comprimidos junto com tópicos periféricos.

### Reorganização recomendada

O trecho avançado da trilha deve ser reorganizado assim:

- Módulo 6. Gramáticas Regulares
- Módulo 7. Fechamento, Decisão e Equivalência
- Módulo 8. Aplicações de Linguagens Regulares
- Módulo 9. Gramáticas Livres de Contexto
- Módulo 10. Autômatos de Pilha
- Módulo 11. Lema do Bombeamento
- Módulo 12. Máquinas de Turing e ALL
- Módulo 13. Decidibilidade, Reduções e Rice
- Módulo 14. Hierarquia de Chomsky
- Módulo 15. Moore e Mealy

### Consequência prática

O arquivo atual `mod12_chomsky.ts` está sobrecarregado e deve ser dividido em pelo menos três módulos:

- um de Turing;
- um de decidibilidade;
- um da hierarquia.

## Módulo 6. Gramáticas Regulares

### Arquivo atual

- `src/data/theory/modules/mod6_gramaticas_regulares.ts:5-15`

### Estado atual

Hoje o módulo tem uma única definição curta. Isso é insuficiente.

### Estrutura desejada

#### Lição 6.1 — Definição formal e formas válidas

### Conteúdo obrigatório

- gramática regular à direita;
- gramática regular à esquerda;
- quando não misturar as formas;
- relação com linguagens regulares.

### Texto-base pronto

`Uma gramática regular produz, em cada regra, no máximo uma variável no lado direito, posicionada de modo sistemático. Na forma à direita, as produções têm a forma A -> aB, A -> a ou A -> ε. Na forma à esquerda, a variável aparece antes do terminal. Em geral, fixamos uma convenção por gramática para evitar ambiguidade estrutural.`

#### Lição 6.2 — GR como gerador e AFD/AFN como reconhecedores

### Conteúdo obrigatório

- diferença entre gerar e reconhecer;
- mesma linguagem, perspectivas diferentes;
- exemplo simples em paralelo:
  - gramática;
  - AFN correspondente;
  - linguagem descrita.

#### Lição 6.3 — Conversão GR → AFN

### Conteúdo obrigatório

- uma variável vira estado;
- estado final auxiliar;
- produções terminais;
- produções com variável;
- caso de `ε`.

### Algoritmo pronto para inserir

1. Crie um estado para cada variável da gramática.
2. Marque o estado da variável inicial como estado inicial do AFN.
3. Crie um estado final auxiliar.
4. Para cada produção `A -> aB`, adicione transição `A -a-> B`.
5. Para cada produção `A -> a`, adicione transição `A -a-> F`.
6. Se a gramática gerar `ε`, marque o estado inicial como final ou trate o caso por estado final auxiliar, conforme a convenção adotada.

#### Lição 6.4 — Conversão AF para GR

### Conteúdo obrigatório

- um estado vira variável;
- transições viram produções;
- estados finais geram produções terminais adequadas;
- caso de estado inicial final.

#### Lição 6.5 — Exercícios de tradução

### Conteúdo obrigatório

- dado um AFD, gerar uma GR;
- dada uma GR, obter AFN;
- validar se uma gramática é regular ou não.

### Erro comum obrigatório

Título:

`Chamar toda gramática simples de regular`

Correção:

`Não basta a gramática parecer curta. Para ser regular, as produções precisam obedecer à forma estrutural da classe tipo 3.`

## Módulo 7. Fechamento, Decisão e Equivalência

### Arquivo atual

- `src/data/theory/modules/mod7_fechamentos.ts:5`

### Estado atual

O módulo tem boa intenção, mas o arquivo está curto e ainda contém regressão de encoding no título.

### Estrutura desejada

#### Lição 7.1 — Fechamento por construção

Separar por famílias:

- união e interseção via produto;
- complemento via totalização;
- reverso;
- concatenação e estrela.

#### Lição 7.2 — Equivalência de autômatos

Nova lição obrigatória.

### Conteúdo obrigatório

- equivalência como igualdade de linguagem;
- teste por diferença simétrica;
- relação com minimização.

### Texto-base pronto

`Dizer que dois autômatos são equivalentes não significa que têm o mesmo desenho. Significa que aceitam exatamente a mesma linguagem. Dois AFDs estruturalmente diferentes podem ser equivalentes, e a comparação correta deve ser feita no nível da linguagem reconhecida.`

#### Lição 7.3 — Problemas de decisão para linguagens regulares

Conteúdo obrigatório:

- pertinência;
- vazio;
- finitude;
- inclusão;
- equivalência.

#### Lição 7.4 — Provas curtas de decidibilidade

Nova lição.

### Objetivo

Ensinar o aluno a escrever justificativas formais curtas, não só a saber o algoritmo.

### Texto-base pronto

`Para provar que um problema é decidível, não basta dizer que existe um autômato. É preciso apresentar um procedimento efetivo que sempre termina com resposta sim ou não.`

## Módulo 8. Aplicações de Linguagens Regulares

### Arquivo atual

- `src/data/theory/modules/mod8_aplicacoes.ts`

### Diagnóstico

O módulo atual mistura análise léxica e gramáticas de grafos. Como referência principal, o produto precisa priorizar primeiro a aplicação clássica e obrigatória da disciplina.

### Estratégia recomendada

- manter análise léxica como núcleo do módulo;
- mover gramáticas de grafos para seção `tópico avançado` ou `material complementar`.

### Estrutura desejada

#### Lição 8.1 — Tokens e análise léxica

### Conteúdo obrigatório

- o que é token;
- classes léxicas;
- uso de ER e AFD em scanners;
- prioridade entre padrões;
- maior casamento possível.

### Texto-base pronto

`Na análise léxica, não basta reconhecer se uma palavra pertence a uma linguagem. O scanner precisa decidir como segmentar o fluxo de caracteres em tokens, respeitando prioridade entre regras e, em geral, a estratégia de maior prefixo possível.`

#### Lição 8.2 — ER, AFD e implementação de scanners

Conteúdo obrigatório:

- pipeline conceitual:
  - especificação em ER;
  - conversão para AFN;
  - determinização;
  - minimização opcional;
  - execução como scanner.

#### Lição 8.3 — Exemplos de tokens reais

Conteúdo obrigatório:

- identificador;
- número inteiro;
- espaço em branco;
- palavra reservada.

#### Lição 8.4 — Tópico avançado: gramáticas de grafos

O exemplo do Pac-Man pode permanecer, mas deve ser claramente marcado como material de ampliação, não como núcleo da disciplina.

### Rótulo recomendado

`Extensão opcional: além de cadeias lineares`

## Módulo 9. Gramáticas Livres de Contexto

### Arquivo atual

- `src/data/theory/modules/mod10_glc.ts`

### Estado atual

O módulo atual é bom como início, mas precisa crescer muito para sustentar GLC de verdade.

### Estrutura desejada

#### Lição 9.1 — Definição formal de GLC

Manter e aprofundar:

- 4-upla;
- variáveis;
- terminais;
- produções;
- símbolo inicial.

#### Lição 9.2 — Derivação à esquerda, à direita e árvore

Precisa deixar muito claro:

- forma sentencial;
- derivação;
- árvore de derivação;
- quando duas derivações geram a mesma árvore;
- quando duas árvores distintas implicam ambiguidade.

#### Texto-base pronto

`Derivação e árvore não são a mesma coisa. Uma árvore fixa a estrutura sintática; a derivação fixa a ordem em que as variáveis foram reescritas. Duas derivações diferentes podem induzir a mesma árvore, mas duas árvores diferentes para a mesma palavra caracterizam ambiguidade.`

#### Lição 9.3 — Linguagens clássicas de GLC

Conteúdo obrigatório:

- `a^n b^n`;
- palíndromos;
- expressões balanceadas;
- precedência de operadores.

#### Lição 9.4 — Ambiguidade

Conteúdo obrigatório:

- definição formal;
- exemplo clássico;
- por que importa;
- gramáticas ambíguas versus linguagens inerentemente ambíguas.

#### Lição 9.5 — Normalizações e preparação para algoritmo

Conteúdo:

- remoção de `ε`;
- remoção de unitárias;
- símbolos inúteis;
- preparação para CNF.

#### Lição 9.6 — Forma Normal de Chomsky e CYK

Conteúdo obrigatório:

- por que CNF importa;
- algoritmo CYK em alto nível;
- mini-exemplo de pertencimento.

#### Lição 9.7 — Forma Normal de Greibach

Conteúdo:

- objetivo;
- propriedades;
- quando usar.

## Módulo 10. Autômatos de Pilha

### Arquivo atual

- `src/data/theory/modules/mod11_ap.ts`

### Estado atual

Hoje o módulo é muito curto para um tema que normalmente ocupa parte relevante da disciplina.

### Estrutura desejada

#### Lição 10.1 — Definição formal de AP

Deve incluir:

- componentes do AP;
- alfabeto da fita;
- alfabeto da pilha;
- símbolo inicial de pilha;
- formas de aceitação;
- transição como leitura e manipulação de pilha.

### Texto-base pronto

`O AP adiciona uma memória em pilha ao autômato finito. Essa pilha não é um detalhe de implementação: ela é o mecanismo central que permite reconhecer dependências aninhadas, como balanceamento e contagem correlacionada.`

#### Lição 10.2 — Configuração instantânea

Nova lição obrigatória.

### Conteúdo obrigatório

- estado atual;
- entrada restante;
- conteúdo da pilha;
- noção de passo de computação.

#### Lição 10.3 — Exemplo completo `a^n b^n`

Já existe, mas deve crescer para:

- fase de empilhar;
- fase de desempilhar;
- condição de rejeição;
- traço de execução completo.

#### Lição 10.4 — Aceitação por estado final e por pilha vazia

Deve incluir:

- equivalência em poder;
- transformações entre convenções;
- quando cada uma é mais confortável didaticamente.

#### Lição 10.5 — AP determinístico x não determinístico

Nova lição.

### Conteúdo obrigatório

- por que DPDA não reconhece todas as CFL;
- exemplo intuitivo;
- impacto em parsing.

#### Lição 10.6 — Relação entre GLC e AP

Conteúdo obrigatório:

- toda CFL é reconhecida por algum AP não determinístico;
- toda linguagem reconhecida por AP é gerada por alguma GLC;
- ideia da correspondência, sem exigir formalismo completo em primeiro momento.

## Módulo 11. Lema do Bombeamento

### Diagnóstico

Existe tópico de exercícios `pumping` em `src/data/constants.ts:78`, mas não há módulo teórico dedicado no conjunto de `courseModules`.

### Consequência

O aluno encontra prática de um assunto que não foi desenvolvido na trilha com o mesmo nível de detalhe.

### Módulo obrigatório novo

Criar `src/data/theory/modules/mod13_pumping.ts` ou reposicionar a numeração conforme a nova trilha.

### Estrutura desejada

#### Lição 11.1 — Intuição do laço em AFD

### Texto-base pronto

`Se um AFD possui número finito de estados, então palavras longas o suficiente forçam repetição de estado durante a leitura. Essa repetição cria um laço que pode ser percorrido zero, uma ou várias vezes sem abandonar a linguagem, e é essa observação que sustenta o lema do bombeamento.`

#### Lição 11.2 — Enunciado formal

Conteúdo obrigatório:

- existência de `p`;
- decomposição `w = xyz`;
- condições sobre `y`;
- validade para todo `i >= 0`.

#### Lição 11.3 — Como usar em prova de não regularidade

Passos obrigatórios:

1. suponha regularidade;
2. tome palavra suficientemente longa;
3. considere decomposição arbitrária válida;
4. escolha bombeamento adequado;
5. derive contradição.

#### Lição 11.4 — Erros comuns

Conteúdo obrigatório:

- escolher a decomposição em vez de quantificar sobre todas;
- usar o lema para provar regularidade;
- esquecer de respeitar `|xy| <= p`.

### Erro comum pronto

`No lema do bombeamento, quem escolhe a palavra é a prova; quem escolhe a decomposição é o adversário. A prova só escolhe o valor de bombeamento i depois disso.`

## Módulo 12. Máquinas de Turing e ALL

### Arquivo atual

- `src/data/theory/modules/mod12_chomsky.ts`

### Problema

O conteúdo atual mistura máquina de Turing, ALL, reduções, decidibilidade, Rice e hierarquia. Isso precisa ser separado.

### Estrutura desejada

#### Lição 12.1 — Definição formal de MT

Conteúdo obrigatório:

- fita;
- cabeça;
- alfabeto de fita;
- alfabeto de entrada;
- movimentos `L`, `R`, `S`;
- estados finais.

#### Lição 12.2 — Configuração e computação

Conteúdo obrigatório:

- como representar uma configuração;
- o que significa "a máquina para";
- diferença entre aceitar, rejeitar e divergir.

#### Lição 12.3 — Máquinas como modelo de algoritmo

Texto-base:

`A máquina de Turing não é importante porque seja prática de programar, e sim porque formaliza a noção de procedimento efetivo geral.`

#### Lição 12.4 — Exemplos clássicos

Conteúdo:

- copiar palavra;
- reconhecer `a^n b^n`;
- reconhecer palíndromos;
- ideia de simulação de outros modelos.

#### Lição 12.5 — ALL

Conteúdo obrigatório:

- restrição de fita;
- relação com linguagens sensíveis ao contexto;
- diferença entre poder de MT e ALL.

## Módulo 13. Decidibilidade, Reduções e Rice

### Novo módulo obrigatório

Separar do conteúdo de Turing.

### Estrutura desejada

#### Lição 13.1 — Decidível, reconhecível e co-reconhecível

Conteúdo obrigatório:

- linguagem decidível;
- linguagem reconhecível;
- máquina que pode divergir;
- intuição operacional.

#### Lição 13.2 — Redução many-one

Conteúdo obrigatório:

- definição;
- ideia estratégica;
- por que provar redução é transferir dificuldade.

#### Texto-base pronto

`Uma redução não resolve o problema original. Ela mostra que, se conseguíssemos resolver o problema-alvo, também conseguiríamos resolver um problema que já sabemos ser difícil ou impossível naquele sentido.`

#### Lição 13.3 — HALT, ACCEPT e EMPTY

Conteúdo obrigatório:

- descrição;
- papel histórico;
- relação entre si.

#### Lição 13.4 — Teorema de Rice

Conteúdo obrigatório:

- propriedade semântica;
- não trivialidade;
- exemplos típicos.

#### Lição 13.5 — PCP

Conteúdo obrigatório:

- definição do problema;
- por que aparece em cursos de LFA;
- papel como problema-padrão de indecidibilidade.

## Módulo 14. Hierarquia de Chomsky

### Novo módulo obrigatório separado

O conteúdo atual de hierarquia deve virar fechamento da trilha, não contêiner de vários assuntos.

### Estrutura desejada

#### Lição 14.1 — Classes e inclusões

Conteúdo:

- tipo 3, 2, 1 e 0;
- modelos correspondentes;
- inclusões próprias.

#### Lição 14.2 — Linguagens testemunha

Conteúdo obrigatório:

- regular não trivial;
- CFL não regular;
- CSL não CFL;
- RE não decidível.

#### Lição 14.3 — Como posicionar um problema na hierarquia

Conteúdo:

- reconhecer padrão de memória necessária;
- escolher linguagem-testemunha;
- usar ferramentas corretas.

## Módulo 15. Moore e Mealy

### Arquivo atual

- `src/data/theory/modules/mod9_moore_mealy.ts`

### Diagnóstico

O tema existe, mas ainda está curto e deslocado no percurso principal. Ele deve permanecer no produto, mas como módulo complementar ou eletivo da trilha principal.

### Estrutura desejada

#### Lição 15.1 — Transdutores finitos

Conteúdo:

- aceitador versus transdutor;
- saída em estado versus saída em transição.

#### Lição 15.2 — Conversões entre Moore e Mealy

Conteúdo:

- quando a conversão preserva comportamento;
- diferença de sincronização da saída;
- exemplo completo.

#### Lição 15.3 — Casos de uso

Conteúdo:

- protocolos simples;
- circuitos de controle;
- modelos reativos.

## Conteúdo complementar obrigatório em todos os módulos avançados

Cada um destes módulos deve terminar com:

- resumo final;
- erros comuns;
- exercícios associados;
- bibliografia;
- ligação explícita para simulador ou visualização.

## Checklist de pronto para os módulos 6 a 12 e expansões

Este eixo só está pronto quando:

1. Gramáticas regulares tiverem conversão nos dois sentidos.
2. GLC tiver ambiguidade, CNF e CYK.
3. AP tiver configuração instantânea e relação com GLC.
4. Houver módulo teórico explícito para lema do bombeamento.
5. Turing estiver separado de decidibilidade.
6. Hierarquia de Chomsky aparecer como síntese final, não como módulo sobrecarregado.
7. Moore/Mealy estiverem contextualizados como tópico complementar, não como substituto de conteúdo central faltante.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] O produto já tem presença teórica para GR, GLC, AP, Moore/Mealy, Turing, hierarquia e tópicos de decidibilidade no intervalo `mod6` a `mod12`.
- [x] O módulo de GLC já inclui um bloco `interactive-grammar`, e o módulo de AP já tem exemplo visual com autômato.
- [x] O banco de exercícios já cobre `gr`, `cfg`, `pda`, `turing`, `chomsky`, `moore_mealy` e `pumping`.

### Parcial

- [ ] O módulo `7` já apresenta fechamentos e decisão, mas continua curto e ainda tem regressão de encoding no título.
- [ ] O módulo `8` já cobre análise léxica e gramáticas de grafos, porém sem separar claramente núcleo obrigatório e ampliação opcional.
- [ ] O módulo `10` já trata definição, derivações e CNF/GNF, mas ainda sem a densidade prevista para ambiguidade, linguagens clássicas e CYK.
- [ ] O módulo `11` já cobre definição de AP, `a^n b^n` e formas de aceitação, mas ainda não inclui configuração instantânea, DPDA vs. NPDA e relação forte com GLC.
- [ ] O módulo `12` já cobre hierarquia, MT/ALL, reduções e Rice, mas isso confirma o problema de sobrecarga apontado pelo plano.
- [ ] O módulo `9` existe, mas continua curto e ainda não está claramente posicionado como conteúdo complementar.

### Não feito

- [ ] O módulo `6` ainda tem apenas uma definição curta e não implementa as conversões GR ↔ AF.
- [ ] Ainda não existe módulo teórico dedicado para lema do bombeamento.
- [ ] Ainda não existem módulos separados para Turing, decidibilidade/reduções e hierarquia.
- [ ] Os módulos avançados ainda não fecham com resumo, erros comuns, bibliografia e vínculos explícitos com exercícios/simulador.
- [ ] O checklist de pronto deste documento ainda não é satisfeito pelo estado atual da trilha avançada.
