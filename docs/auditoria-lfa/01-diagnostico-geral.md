# Diagnóstico Geral do Projeto

## Leitura Rápida

O projeto tem um núcleo forte de simulação e uma base razoável de conteúdo, mas ainda apresenta oito problemas estruturais que impedem o produto de operar como referência completa e confiável de LFA.

## 1. O site ainda está posicionado como página de uma turma, não como plataforma de referência

### Onde está o problema

- `src/pages/Home.tsx:5-15`
- `src/pages/Home.tsx:27`
- `src/pages/Home.tsx:66`
- `src/pages/Content.tsx:434`
- `src/data/theoryData.ts:21`

### O que está errado

A página inicial ainda exibe:

- sala física;
- horários específicos;
- cronograma de provas com datas fechadas;
- código de disciplina e turma;
- rótulo `Material P1`.

Isso faz o produto parecer um apoio circunstancial de semestre, não um ambiente de estudo duradouro.

### Por que isso prejudica o objetivo

Quem busca uma referência quer estabilidade, abrangência e reuso. Quando a primeira camada do produto comunica "turma X do semestre Y", o usuário entende que:

- o material pode estar desatualizado;
- o escopo pode estar limitado ao que caiu na prova;
- o conteúdo pode não cobrir a disciplina inteira;
- o site não foi desenhado para múltiplos perfis de estudante.

### Como deve ser

A home precisa ser reposicionada como portal de estudo permanente.

Deve sair:

- agenda de turma;
- prova 1, prova 2, segunda chamada;
- identificação de sala e horário;
- rótulo `Material P1`.

Deve entrar:

- proposta de valor clara;
- trilhas de estudo;
- mapa completo da disciplina;
- destaque para simulador, exercícios, provas conceituais e revisão rápida;
- progresso pessoal do aluno.

### Copy recomendada

#### Hero

Título:

`Aprenda Linguagens Formais e Autômatos do zero ao nível de prova, monitoria e projeto.`

Subtítulo:

`Estude definições formais, visualize máquinas e gramáticas, pratique com feedback e revise os tópicos centrais de LFA em uma única plataforma.`

Botões:

- `Começar pela trilha guiada`
- `Abrir simulador`
- `Resolver exercícios`

#### Blocos logo abaixo

- `Estudo guiado`
  `Siga a sequência recomendada, com pré-requisitos e objetivos por lição.`

- `Simulação interativa`
  `Teste AFD, AFN, AP, MT, gramáticas e conversões em tempo real.`

- `Prática com feedback`
  `Receba pistas, contraexemplos, traços de execução e soluções guiadas.`

## 2. Há inconsistência editorial e de encoding em conteúdo visível

### Onde está o problema

- `src/data/theory/modules/mod7_fechamentos.ts:5`
- `src/data/theory/modules/mod10_glc.ts:5`
- `src/data/theory/modules/mod12_chomsky.ts:5`
- `src/data/constants.ts:31`
- `src/data/constants.ts:123`

### O que está errado

Há vários textos com acentuação ausente, títulos inconsistentes e sinais de regressão de encoding:

- `MA3dulo 7`
- `Modulo`
- `Gramaticas`
- `Decisao`
- `Transicoes`
- `divisiveis`

### Por que isso prejudica o objetivo

Esse tipo de erro é pequeno tecnicamente, mas grande pedagogicamente. Em uma plataforma educacional, erros de língua e apresentação minam a confiança do aluno, especialmente em uma disciplina formal e rigorosa.

### Como deve ser

Toda a camada editorial precisa seguir uma política única:

- pt-BR consistente;
- arquivos em UTF-8;
- títulos com o mesmo padrão;
- terminologia única para os mesmos conceitos.

### Regra editorial obrigatória

- `Módulo`, não `Modulo`.
- `Gramáticas`, não `Gramaticas`.
- `Decisão`, não `Decisao`.
- `Transições`, não `Transicoes`.
- `divisíveis`, não `divisiveis`.
- `autômatos`, `gramáticas`, `linguagens`, `símbolos`, `produção`, `derivação`.

## 3. A cobertura curricular existe, mas a profundidade é extremamente desigual

### Onde está o problema

- `src/data/theory/modules/mod6_gramaticas_regulares.ts:5`
- `src/data/theory/modules/mod8_aplicacoes.ts:5`
- `src/data/theory/modules/mod9_moore_mealy.ts:4`
- `src/data/theory/modules/mod11_ap.ts:4`
- `src/data/theory/modules/mod12_chomsky.ts:5`

### O que está errado

O projeto tem módulos para muitos temas, mas vários deles são rasos demais para sustentar aprendizado real:

- `mod6` tem praticamente uma definição.
- `mod8` mistura análise léxica e gramáticas de grafos com pouca mediação.
- `mod9` é curto demais para Moore/Mealy.
- `mod11` é insuficiente para AP.
- `mod12` concentra Turing, ALL, reduções, Rice, decidibilidade e hierarquia em pouco espaço.

### Por que isso prejudica o objetivo

Uma referência completa precisa ter duas qualidades ao mesmo tempo:

- amplitude;
- profundidade mínima por tema.

Hoje o projeto tem bastante amplitude de rótulos, mas vários módulos não têm densidade suficiente para um aluno aprender do zero.

### Como deve ser

O conteúdo deve ser reequilibrado.

Temas obrigatórios precisam ter:

- definição formal;
- intuição;
- exemplos resolvidos;
- casos limite;
- erros comuns;
- construção ou prova;
- exercício de fixação;
- integração com simulador, quando fizer sentido.

## 4. Há um problema conceitual no tratamento de AFD

### Onde está o problema

- `src/data/theory/modules/mod1_afd.ts:20`
- `src/data/theory/modules/mod1_afd.ts:106-137`

### O que está errado

O texto do módulo diz:

`δ: Q × Σ → Q (parcial)` e depois afirma que faltas de transição fazem o autômato travar e rejeitar.

Mais adiante, o próprio módulo ensina a noção de `AFD total` e estado de erro.

### Por que isso prejudica o objetivo

Isso mistura duas convenções diferentes:

- AFD clássico, em que `δ` é total;
- AFD incompleto, em que a implementação permite omissão de transições.

Sem separar claramente as duas noções, o aluno aprende uma definição formal ambígua e pode errar em prova, lista e implementação.

### Como deve ser

O módulo precisa dizer explicitamente uma das duas coisas:

#### Opção recomendada

Adotar formalmente:

`δ: Q × Σ → Q`

e tratar ausência de transição como abreviação visual de uma ida implícita a estado sumidouro.

#### Opção aceitável

Dizer que o projeto usa a convenção de `AFD incompleto` para simplificar desenho, mas que:

- a definição clássica é total;
- para provas de complemento e minimização, o autômato deve ser totalizado.

## 5. O sistema de busca do conteúdo é superficial demais

### Onde está o problema

- `src/pages/Content.tsx:304-312`

### O que está errado

A busca da seção de conteúdo filtra apenas:

- `lesson.title`
- `lesson.description`

Ela não indexa:

- texto dos blocos;
- definições;
- teoremas;
- algoritmos;
- tags;
- palavras-chave;
- nomes formais como `δ̂`, `CNF`, `Myhill-Nerode`, `Rice`, `ε-fecho`.

### Por que isso prejudica o objetivo

Uma referência de estudo precisa funcionar também como material de consulta rápida. Se o aluno lembra do conceito mas não da lição exata, a busca atual não ajuda.

### Como deve ser

A busca precisa indexar:

- título do módulo;
- título da lição;
- descrição;
- todo texto em `ContentBlock`;
- objetivos da lição;
- tags;
- termos formais e sinônimos.

Também precisa oferecer filtros:

- assunto;
- tipo de conteúdo;
- nível;
- possui simulador;
- possui exercício;
- revisado ou rascunho.

## 6. O modelo de exercício ainda entrega gabarito, não solução pedagógica guiada

### Onde está o problema

- `src/pages/Exercises.tsx:785-807`
- `src/pages/Exercises.tsx:820-845`
- `src/pages/Exercises.tsx:1134-1224`

### O que está errado

Hoje a UI do exercício trabalha principalmente com:

- `Dica`;
- `Ver resposta`;
- `Verificar solução`.

Isso é útil, mas ainda insuficiente para aprendizagem iterativa. Em muitos casos, o aluno sai do estado:

`não sei resolver`

direto para:

`vi o gabarito`

sem passar por:

- estratégia;
- decomposição do problema;
- diagnóstico do erro;
- comparação entre caminhos de solução.

### Por que isso prejudica o objetivo

Exercício resolvido não é gabarito. Exercício resolvido é uma explicação de processo.

Sem solução guiada, o site ajuda mais a conferir resposta do que a formar raciocínio.

### Como deve ser

Cada exercício relevante deve ter camadas:

1. Enunciado.
2. Pista 1.
3. Pista 2.
4. Estratégia.
5. Solução guiada em etapas.
6. Gabarito final.
7. Erros comuns.
8. Variações do mesmo padrão.

## 7. A interatividade está concentrada no simulador e pouco distribuída no conteúdo

### Onde está o problema

- `src/pages/Content.tsx:233-247`
- `src/data/theory/modules/mod10_glc.ts:32`

### O que está errado

O conteúdo teórico já suporta visualização de autômatos e um bloco `interactive-grammar`, mas a densidade de interatividade no corpo das lições ainda é pequena.

### Por que isso prejudica o objetivo

O diferencial prometido pelo produto é ensinar de forma iterativa com texto, animação e prática. Se a maior parte da interação só acontece ao sair do conteúdo e ir para o simulador, a experiência pedagógica fica fragmentada.

### Como deve ser

Cada módulo central precisa ter pelo menos uma destas experiências no corpo da lição:

- exemplo animado;
- simulação embutida;
- transformação passo a passo;
- exercício curto no meio da explicação;
- comparação visual entre modelos equivalentes;
- erro comum demonstrado visualmente.

## 8. Falta um sistema explícito de bibliografia e rastreabilidade

### Onde está o problema

- referências pontuais a `Blauth` em vários módulos, como:
  - `src/data/theory/modules/mod0_fundamentos.ts:23`
  - `src/data/theory/modules/mod1_afd.ts:29`
  - `src/data/theory/modules/mod4_minimizacao.ts:18`
  - `src/data/theory/modules/mod9_moore_mealy.ts:28`

### O que está errado

Há menções soltas ao livro, mas não existe:

- modelo de referência por lição;
- bibliografia centralizada;
- indicação de capítulo/página por conceito;
- distinção entre conteúdo canônico e comentário autoral.

### Por que isso prejudica o objetivo

Uma referência forte não precisa ser "só um resumo". Ela precisa apontar origem, autoridade e aprofundamento.

### Como deve ser

Cada lição deve informar:

- bibliografia base;
- capítulos/páginas de apoio;
- escopo da lição;
- o que é adaptação didática do site;
- relações com outros tópicos.

## 9. Há desalinhamento entre mapa temático e trilha teórica

### Onde está o problema

- `src/data/constants.ts:18`
- `src/data/constants.ts:30`
- `src/data/constants.ts:66`
- `src/data/constants.ts:78`
- `src/data/theoryData.ts:21`

### O que está errado

Existem tópicos de exercícios como:

- `lex`
- `afne`
- `turing`
- `pumping`

mas a trilha teórica não espelha esse mapa com a mesma clareza e profundidade. Isso faz parecer que teoria e prática pertencem a produtos diferentes.

### Por que isso prejudica o objetivo

Se o aluno encontra exercício de um tema que não foi ensinado com a mesma granularidade, a plataforma quebra sua promessa de percurso completo.

### Como deve ser

O mesmo mapa conceitual deve organizar:

- conteúdo;
- exercícios;
- simulador;
- busca;
- revisão.

## 10. O projeto já é forte tecnicamente, mas precisa ser sustentado por revisão pedagógica sistemática

### Onde está o problema

- `src/simulation/SimulationEngine.ts`
- `src/hooks/useProgress.ts`
- `src/features/navigation/routeState.ts`
- `src/utils/grammar.ts`
- conjunto de testes em `src/utils/conversions/*.test.ts` e `src/simulation/SimulationEngine.test.ts`

### O que está certo

O projeto não é frágil. Há engenharia real no simulador, persistência e testes.

### O que falta

Falta o equivalente editorial desse rigor:

- critérios de revisão de conteúdo;
- status de maturidade por lição;
- checklist de consistência conceitual;
- validação cruzada entre teoria e exercício.

### Como deve ser

O produto precisa tratar conteúdo como software:

- com estrutura de dados;
- com revisão;
- com rastreabilidade;
- com critérios de aceite;
- com evolução incremental.

## Fechamento

O site não precisa ser reinventado do zero. A base de engenharia já permite uma evolução séria. O que falta é reorganizar o produto em torno de uma arquitetura pedagógica mais rigorosa, mais completa e mais estável.

Os próximos documentos desta pasta descrevem exatamente:

- o que mudar;
- em quais arquivos;
- em que ordem;
- com qual conteúdo;
- e com qual definição de pronto.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] O projeto já tem um núcleo técnico forte em simulação, persistência, roteamento por URL e testes automatizados.
- [x] Já existe integração funcional entre conteúdo, exercícios e simulador no fluxo da aplicação.

### Parcial

- [ ] A cobertura curricular existe e os módulos `0` a `3` são os mais maduros, mas a profundidade segue desigual na segunda metade da trilha.
- [ ] A interatividade já aparece em exemplos visuais, comparação de autômatos e no bloco `interactive-grammar`, mas continua concentrada em poucos pontos do conteúdo.
- [ ] Há referências pontuais a Blauth e uso recorrente do livro como base, mas sem sistema formal de bibliografia e rastreabilidade.
- [ ] O mapa de exercícios já cobre `lex`, `pumping`, `turing`, `cfg`, `pda` e outros tópicos, porém a trilha teórica ainda não espelha essa granularidade com a mesma clareza.

### Não feito

- [ ] O site ainda comunica identidade de turma em pontos críticos da interface, como `DCC063 • Turma A` na home e `Material P1` na sidebar de conteúdo.
- [ ] Persistem regressões editoriais e de encoding em títulos e textos, como `MA3dulo`, `Modulo`, `Decisao` e `divisiveis`.
- [ ] A busca de conteúdo ainda filtra apenas `lesson.title` e `lesson.description`.
- [ ] O módulo de AFD ainda apresenta `δ: Q × Σ → Q (parcial)` sem separar claramente a convenção didática da definição clássica.
- [ ] O modelo atual de exercícios ainda depende de `dica` e `ver resposta`, sem solução guiada em camadas.
- [ ] Ainda não há um sistema explícito de bibliografia, fontes por lição e rastreabilidade editorial.
