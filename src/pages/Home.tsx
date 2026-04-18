import { BookOpen, ChevronRight, Code, GraduationCap, Move, PenTool, Play } from 'lucide-react';
import type { Tab } from '../types';

const entryPoints = [
    {
        title: 'Começar pela trilha',
        description: 'Estude em sequência, com objetivos, pré-requisitos e resumo por lição.',
        icon: GraduationCap,
        tab: 'conteudo' as const
    },
    {
        title: 'Resolver exercícios',
        description: 'Pratique construções, conversões e provas com verificação e feedback.',
        icon: PenTool,
        tab: 'exercicios' as const
    },
    {
        title: 'Abrir simulador',
        description: 'Teste AFD, AFN, AP, gramáticas e máquinas em um laboratório visual.',
        icon: Play,
        tab: 'simulador' as const
    }
] as const;

const learningJourney = [
    {
        label: 'Fundamentos',
        eyebrow: 'Base',
        status: 'done',
        description: 'Alfabetos, linguagens, operações, notação e leitura formal.'
    },
    {
        label: 'Regulares',
        eyebrow: 'Núcleo',
        status: 'active',
        description: 'AFD, AFN, expressões regulares, equivalência e minimização.'
    },
    {
        label: 'Pilha e gramáticas',
        eyebrow: 'Expansão',
        status: 'next',
        description: 'Gramáticas regulares, GLC, AP e formas normais.'
    },
    {
        label: 'Computabilidade',
        eyebrow: 'Fecho',
        status: 'next',
        description: 'Turing, decidibilidade, hierarquia e tópicos complementares.'
    }
] as const;

const studySignals = [
    {
        title: 'Teoria conectada à prática',
        description: 'As lições foram pensadas para levar do conceito formal ao experimento no simulador.'
    },
    {
        title: 'Revisão orientada',
        description: 'Objetivos, palavras-chave, resumos e erros comuns deixam a consulta mais rápida.'
    },
    {
        title: 'Percurso completo',
        description: 'A trilha cobre os fundamentos até computabilidade sem depender de um semestre específico.'
    }
] as const;

export const HomeSection = ({ onNavigate }: { onNavigate: (tab: Tab) => void }) => (
    <div className="render-lite-shell animate-fade-in space-y-6 md:space-y-8">
        <div className="relative flex min-h-[360px] items-center overflow-hidden rounded-[28px] text-white shadow-apple-xl md:min-h-[420px] md:rounded-[32px]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute -top-24 right-[-10%] h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[90px]" />

            <div className="relative z-10 flex w-full flex-col items-start justify-between gap-10 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
                <div className="max-w-3xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-blue-200 shadow-sm ui-kicker">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                        Plataforma contínua de estudo em LFA
                    </div>
                    <h1 className="ui-title-hero mb-6 text-white">
                        Aprenda Linguagens Formais e Autômatos
                        <br />
                        <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                            do conceito à resolução.
                        </span>
                    </h1>
                    <p className="ui-body-lg mb-7 max-w-2xl font-medium text-slate-200">
                        Estude definições formais, visualize execuções, pratique com feedback e use a trilha como material de consulta antes de prova, monitoria ou projeto.
                    </p>
                    <blockquote className="mb-8 border-l-4 border-blue-300/60 pl-4 text-slate-300 ui-body-sm italic">
                        "Teoria das Linguagens Formais foi originariamente desenvolvida na década de 1950 com o objetivo de desenvolver teorias relacionadas com as linguagens naturais."
                        <br />
                        <span className="text-xs font-bold not-italic text-slate-400">- Paulo Blauth Menezes</span>
                    </blockquote>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => onNavigate('conteudo')}
                            className="flex w-full items-center justify-center gap-3 rounded-full bg-ios-blue px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-600 active:scale-[0.99] sm:w-auto"
                        >
                            <BookOpen size={18} />
                            Começar pela trilha
                        </button>
                        <button
                            onClick={() => onNavigate('exercicios')}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/15 active:scale-[0.99] sm:w-auto"
                        >
                            <PenTool size={18} />
                            Resolver exercícios
                        </button>
                    </div>
                </div>

                <div className="hidden h-72 w-72 items-center justify-center lg:flex">
                    <div className="glass-panel z-20 flex h-44 w-44 flex-col items-center justify-center rounded-[32px] border border-white/15">
                        <Code className="text-blue-200" size={38} />
                        <span className="mt-3 text-sm font-semibold text-slate-200">Laboratório visual</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3" data-deferred-render="section">
            {entryPoints.map((entryPoint) => (
                <button
                    key={entryPoint.title}
                    onClick={() => onNavigate(entryPoint.tab)}
                    className="glass-card group p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-apple-lg md:p-8"
                >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-ios-blue">
                        <entryPoint.icon size={20} />
                    </div>
                    <h2 className="ui-title-4 text-primary">{entryPoint.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-secondary">{entryPoint.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ios-blue">
                        Abrir
                        <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                </button>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3" data-deferred-render="section">
            <div className="glass-card p-6 md:p-8">
                <h3 className="ui-title-4 mb-6 flex items-center gap-3 text-primary">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-ios-blue">
                        <GraduationCap size={20} />
                    </div>
                    Como estudar aqui
                </h3>
                <ul className="space-y-4">
                    {studySignals.map((signal) => (
                        <li key={signal.title} className="rounded-2xl border border-default bg-surface-muted/60 p-4">
                            <span className="block text-sm font-semibold text-primary">{signal.title}</span>
                            <span className="mt-2 block text-sm leading-relaxed text-secondary">{signal.description}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="glass-card relative overflow-hidden p-6 md:col-span-2 md:p-8">
                <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 rounded-full bg-indigo-500/10 p-24 blur-3xl" />

                <h3 className="ui-title-4 mb-8 flex items-center gap-3 text-primary md:mb-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-ios-indigo">
                        <Move size={20} />
                    </div>
                    Trilha sugerida de estudo
                </h3>

                <div className="relative flex flex-col gap-6 px-2 md:flex-row md:items-start md:justify-between md:gap-0 md:px-8">
                    <div className="absolute bottom-[10px] left-[19px] top-[10px] w-px bg-border md:left-12 md:right-12 md:bottom-auto md:top-[18px] md:h-0.5 md:w-auto" />
                    {learningJourney.map((item) => (
                        <div key={item.label} className="relative flex items-start gap-4 md:w-1/4 md:flex-col md:items-center">
                            <div
                                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] shadow-sm transition-all duration-300 ${
                                    item.status === 'active'
                                        ? 'scale-105 border-white/30 bg-ios-blue text-white ring-4 ring-blue-500/20'
                                        : item.status === 'done'
                                            ? 'border-white/20 bg-ios-green/90 text-white'
                                            : 'border-default bg-surface-muted'
                                }`}
                            >
                                {item.status === 'active' ? (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                ) : (
                                    <ChevronRight size={16} className={item.status === 'done' ? 'text-white' : 'text-muted'} />
                                )}
                            </div>

                            <div className="w-full text-left md:text-center">
                                <span className={`mb-1 block text-sm font-bold ${item.status === 'active' ? 'text-ios-blue' : 'text-muted'}`}>
                                    {item.label}
                                </span>
                                <span className="ui-kicker-xs mb-2 inline-block rounded-md bg-surface-muted px-2 py-1 text-muted">
                                    {item.eyebrow}
                                </span>
                                <p className="text-xs leading-normal text-muted">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
