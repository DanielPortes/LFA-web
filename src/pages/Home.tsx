import { Calendar, ChevronRight, Clock, Code, Info, MapPin, Move, Play } from 'lucide-react';
import type { Tab } from '../types';

const classInfo = [
    { icon: MapPin, title: 'Sala 308', subtitle: 'ICE - Depto. de Computação' },
    { icon: Clock, title: 'Segunda: 14h - 16h', subtitle: 'Aula teórica' },
    { icon: Clock, title: 'Quarta: 16h - 18h', subtitle: 'Aula teórica' },
    { icon: Calendar, title: 'Quinta (quinzenal): 14h - 16h', subtitle: 'Atendimento (Sala 432)' }
];

const learningJourney = [
    {
        label: 'Fundamentos',
        eyebrow: 'Base',
        status: 'done',
        description: 'Alfabetos, linguagens, operações e notação formal.'
    },
    {
        label: 'Autômatos Finitos',
        eyebrow: 'Núcleo',
        status: 'active',
        description: 'AFD, AFN, equivalência, regex e minimização.'
    },
    {
        label: 'Gramáticas e AP',
        eyebrow: 'Expansão',
        status: 'next',
        description: 'GLC, derivação, normalização e autômatos com pilha.'
    },
    {
        label: 'Máquinas e aplicações',
        eyebrow: 'Fecho',
        status: 'next',
        description: 'MT, transdutores, hierarquia e aplicações práticas.'
    }
] as const;

export const HomeSection = ({ onNavigate }: { onNavigate: (tab: Tab) => void }) => (
    <div className="animate-fade-in space-y-6 md:space-y-8">
        <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] text-white shadow-apple-xl min-h-[360px] md:min-h-[420px] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute -top-24 right-[-10%] w-[360px] h-[360px] rounded-full bg-blue-500/20 blur-[90px]" />

            <div className="relative p-6 sm:p-8 lg:p-12 w-full z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-12">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 ui-kicker mb-6 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300" /> DCC063 • Turma A
                    </div>
                    <h1 className="ui-title-hero text-white mb-6">
                        Linguagens <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200">Formais.</span>
                    </h1>
                    <p className="ui-body-lg text-slate-200 mb-7 max-w-xl font-medium">
                        Explore autômatos com teoria, exercícios e simulador visual integrado em uma experiência mais clara e objetiva.
                    </p>
                    <blockquote className="border-l-4 border-blue-300/60 pl-4 mb-8 italic text-slate-300 ui-body-sm">
                        "Teoria das Linguagens Formais foi originariamente desenvolvida na década de 1950 com o objetivo de desenvolver teorias relacionadas com as linguagens naturais."
                        <br />
                        <span className="font-bold not-italic text-xs text-slate-400">- Paulo Blauth Menezes (pág. 1)</span>
                    </blockquote>
                    <button
                        onClick={() => onNavigate('simulador')}
                        className="bg-ios-blue text-white w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-600 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
                    >
                        <Play fill="currentColor" size={18} />
                        Começar a simular
                    </button>
                </div>

                <div className="hidden lg:flex relative w-72 h-72 items-center justify-center">
                    <div className="glass-panel w-44 h-44 rounded-[32px] flex flex-col items-center justify-center z-20 border border-white/15">
                        <Code className="text-blue-200" size={38} />
                        <span className="mt-3 text-sm font-semibold text-slate-200">Simulador visual</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 glass-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                    <h3 className="ui-title-4 text-primary mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-ios-blue">
                            <Info size={20} />
                        </div>
                        DCC063 - Turma A
                    </h3>
                    <ul className="space-y-3">
                        {classInfo.map((item) => (
                            <li key={item.title} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-surface-muted transition-colors">
                                <div className="text-muted group-hover:text-ios-blue transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <span className="block font-semibold text-sm text-primary">{item.title}</span>
                                    <span className="ui-body-sm text-muted">{item.subtitle}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="md:col-span-2 glass-card p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="ui-title-4 text-primary mb-8 md:mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-ios-indigo">
                        <Move size={20} />
                    </div>
                    Trilha sugerida da disciplina
                </h3>

                <div className="relative flex flex-col md:flex-row gap-6 md:gap-0 md:justify-between md:items-start px-2 md:px-8">
                    <div className="absolute left-[19px] top-[10px] bottom-[10px] w-px bg-border md:left-12 md:right-12 md:top-[18px] md:bottom-auto md:h-0.5 md:w-auto" />
                    {learningJourney.map((item) => (
                        <div key={item.label} className="relative flex md:flex-col items-start md:items-center gap-4 md:w-1/4">
                            <div
                                className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shadow-sm transition-all duration-300 z-10 ${
                                    item.status === 'active'
                                        ? 'bg-ios-blue border-white/30 text-white ring-4 ring-blue-500/20 scale-105'
                                        : item.status === 'done'
                                            ? 'bg-ios-green/90 border-white/20 text-white'
                                            : 'bg-surface-muted border-default'
                                }`}
                            >
                                {item.status === 'active' ? (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                ) : (
                                    <ChevronRight size={16} className={item.status === 'done' ? 'text-white' : 'text-muted'} />
                                )}
                            </div>

                            <div className="text-left md:text-center w-full">
                                <span className={`block text-sm font-bold mb-1 ${item.status === 'active' ? 'text-ios-blue' : 'text-muted'}`}>
                                    {item.label}
                                </span>
                                <span className="ui-kicker-xs text-muted bg-surface-muted px-2 py-1 rounded-md inline-block mb-2">
                                    {item.eyebrow}
                                </span>
                                <p className="text-xs text-muted leading-normal">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

