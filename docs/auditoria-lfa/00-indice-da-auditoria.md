# Auditoria de Reconstrução do LFA Web

## Objetivo

Esta pasta documenta, com nível de execução, o que precisa ser refatorado no `LFA Web` para que o projeto deixe de parecer um material de apoio de uma turma específica e passe a funcionar como uma plataforma de referência para estudantes de Ciência da Computação em Linguagens Formais e Autômatos.

O foco desta auditoria é o objetivo pedagógico declarado do produto:

1. Ensinar LFA de forma iterativa.
2. Combinar texto, visualização, animação, simulação e exercício resolvido.
3. Cobrir o percurso completo da disciplina com rigor.
4. Ser a primeira referência que o aluno consulta ao estudar, revisar e praticar.

## Estado Atual Levantado

Levantamento realizado sobre o código em `2026-04-14`.

- `13` módulos teóricos em `src/data/theory/modules`.
- `38` lições no total.
- `139` blocos de conteúdo.
- `17` blocos de exemplo.
- `1` bloco interativo de gramática.
- `90` exercícios em `src/data/constants.ts`.
- `29` exercícios com bateria de testes automatizada.
- Simulador cobrindo `AFD`, `AFN`, `AP`, `MT`, `ALL`, `Moore`, `Mealy` e gramáticas.

## Sinais Positivos Já Existentes

- Arquitetura de simulação relativamente sólida em `src/simulation/SimulationEngine.ts`.
- Integração forte entre conteúdo, exercício e simulador em `src/App.tsx`, `src/pages/Content.tsx` e `src/pages/Exercises.tsx`.
- Persistência de progresso em `src/hooks/useProgress.ts`.
- Estado de rota navegável por URL em `src/features/navigation/routeState.ts`.
- Compartilhamento de autômatos em `src/utils/sharing.ts`.
- Modo de gramática com derivação e transformações em `src/hooks/useGrammarSimulation.ts` e `src/features/simulator/panels/GrammarWorkspace.tsx`.
- Testes automatizados relevantes em `src/simulation` e `src/utils/conversions`.

## Problema Central

O projeto já é um bom ambiente de exploração prática, mas ainda não sustenta a promessa de "ensinar tudo" nem a ambição de ser "referência número 1". Hoje ele é mais forte em interface e experimentação do que em trilha curricular completa, consistência editorial, sistema de fontes e resolução guiada.

## Como Esta Auditoria Está Organizada

- `01-diagnostico-geral.md`
  Diagnóstico executivo com problemas concretos, locais exatos do código, impacto pedagógico e estado desejado.

- `02-refatoracoes-estruturais-e-tecnicas.md`
  Refatorações de produto, informação, tipos de dados, busca, referências, navegação e integração conteúdo-simulador.

- `03-plano-editorial-modulos-0-5.md`
  Reestruturação detalhada dos módulos centrais de fundamentos e linguagens regulares.

- `04-plano-editorial-modulos-6-12.md`
  Reestruturação detalhada dos módulos avançados e proposta de novos módulos obrigatórios.

- `05-plano-de-exercicios-e-solucoes.md`
  Como transformar o sistema atual de exercícios em uma camada de prática realmente iterativa, diagnóstica e resolvida.

- `06-roadmap-de-implementacao.md`
  Ordem de execução, arquivos afetados, prioridades e critérios de aceite.

## Meta de Saída Esperada

Ao final da reconstrução, o produto deve ter:

- trilha curricular explícita do básico ao avançado;
- conteúdo teórico com objetivos, pré-requisitos, fontes e erros comuns;
- exercícios com pistas progressivas e solução guiada;
- simulador usado como ferramenta de aprendizagem, não só de desenho;
- cobertura equilibrada dos tópicos de LFA;
- linguagem editorial consistente em pt-BR;
- sensação de plataforma perene, não de página de semestre.

## Critério de Sucesso

O projeto só pode ser considerado "referência nº 1" quando um aluno conseguir fazer as quatro coisas abaixo sem sair do site:

1. Entender um conceito novo com texto e exemplos visuais.
2. Testar esse conceito em simulação.
3. Praticar com exercícios com feedback útil.
4. Revisar rapidamente definições, teoremas, provas e erros frequentes antes de prova ou trabalho.

## Checklist de implementação atual (base: código em 2026-04-15)

### Feito

- [x] O produto já tem base técnica relevante: `13` módulos teóricos, `38` lições, `90` exercícios e simulador para AFD, AFN, AP, MT, ALL, Moore, Mealy e gramáticas.
- [x] Já existe integração funcional entre teoria, prática e simulação por navegação em URL, persistência de progresso e abertura do simulador a partir do conteúdo e dos exercícios.
- [x] O projeto já conta com uma camada de testes para engine, conversões e partes importantes da UI.

### Parcial

- [ ] A trilha já cobre grande parte da disciplina, mas a profundidade ainda é muito desigual entre módulos centrais e avançados.
- [ ] O conteúdo já combina texto, exemplos visuais e um bloco interativo de gramática, mas a interatividade ainda não está distribuída de forma consistente ao longo das lições.
- [ ] O produto já funciona bem como ambiente de exploração prática, mas ainda não sustenta a promessa de referência curricular completa.

### Não feito

- [ ] Ainda não existe uma camada pedagógica estruturada por lição com objetivos, pré-requisitos, erros comuns, resumo e referências.
- [ ] Ainda não existe uma experiência explícita de revisão rápida, glossário, mapa de teoremas e consulta por símbolo/termo formal.
- [ ] O posicionamento do produto ainda não foi totalmente desacoplado de turma e semestre em toda a interface.
