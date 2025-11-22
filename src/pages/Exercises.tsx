import { useState } from 'react';
import { Lightbulb, Eye, EyeOff, Play, ChevronRight, CheckCircle2, ListFilter } from 'lucide-react';
import type { AutomatoData } from '../types';
import { exerciciosDB } from '../data/constants';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';

export const ExerciciosSection = ({ onSimulate }: { onSimulate: (data: AutomatoData) => void }) => {
    const [activeCategory, setActiveCategory] = useState('afd');
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

    const categories = [
        { id: 'afd', label: 'AFDs' },
        { id: 'lex', label: 'Léxico' },
        { id: 'afn', label: 'AFNs' },
        { id: 'afne', label: 'AFNε' },
        { id: 'er', label: 'Regex' },
        { id: 'gr', label: 'Gramática' },
    ];

    const exercicios = exerciciosDB[activeCategory] || [];

    return (
        <div className="h-full flex flex-col md:flex-row gap-8 animate-fade-in pb-10">

            {/* Sidebar Navigation */}
            <div className="md:w-64 flex-shrink-0">
                <div className="glass-panel p-2 rounded-3xl sticky top-28">
                    <div className="flex items-center gap-2 px-4 py-3 text-gray-400 mb-1">
                        <ListFilter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tópicos</span>
                    </div>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setRevealedHints({}); setRevealedAnswers({}); }}
                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex justify-between items-center group relative overflow-hidden
                                    ${activeCategory === cat.id
                                    ? 'text-white font-bold shadow-lg shadow-blue-500/20'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                            >
                                {activeCategory === cat.id && (
                                    <div className="absolute inset-0 bg-ios-blue -z-10" />
                                )}
                                {cat.label}
                                {activeCategory === cat.id && <ChevronRight size={14} className="opacity-80" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 space-y-6">
                <div className="flex items-end justify-between mb-4 px-2">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{categories.find(c => c.id === activeCategory)?.label}</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Lista de exercícios práticos</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-500">{exercicios.length} Questões</span>
                </div>

                {exercicios.map((ex) => (
                    <div key={ex.id} className="glass-card overflow-hidden group hover:shadow-apple-md">
                        <div className="p-8">
                            <div className="flex gap-5 items-start">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 font-mono font-bold text-lg flex items-center justify-center border border-gray-100 dark:border-white/5">
                                    {ex.id}
                                </span>
                                <h3 className="text-lg font-medium text-[var(--text-primary)] leading-relaxed pt-1">{ex.pergunta}</h3>
                            </div>

                            <div className="flex gap-3 mt-8 ml-14">
                                {ex.dica && (
                                    <button
                                        onClick={() => setRevealedHints(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                        className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${revealedHints[ex.id] ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                    >
                                        <Lightbulb size={14} className={revealedHints[ex.id] ? 'fill-current' : ''} />
                                        {revealedHints[ex.id] ? 'Esconder' : 'Dica'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setRevealedAnswers(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                    className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${revealedAnswers[ex.id] ? 'bg-blue-50 text-ios-blue dark:bg-blue-500/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    {revealedAnswers[ex.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {revealedAnswers[ex.id] ? 'Esconder' : 'Ver Resposta'}
                                </button>
                            </div>
                        </div>

                        {/* Hint Section */}
                        {revealedHints[ex.id] && ex.dica && (
                            <div className="mx-8 mb-6 ml-20 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl text-orange-700 dark:text-orange-300 text-sm animate-scale-in">
                                <span className="font-bold mr-2 block mb-1 uppercase tracking-wide text-xs">Pista</span>{ex.dica}
                            </div>
                        )}

                        {/* Answer Section */}
                        {revealedAnswers[ex.id] && (
                            <div className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 p-8 animate-fade-in">
                                <div className="ml-14">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={16} className="text-ios-green" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solução</span>
                                    </div>

                                    <p className="text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-mono text-sm bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                                        {ex.respostaTexto}
                                    </p>

                                    {ex.respostaAutomato && (
                                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse"></div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gabarito Visual</span>
                                                </div>
                                                <button
                                                    onClick={() => onSimulate(ex.respostaAutomato!)}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue/10 hover:bg-ios-blue text-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <Play size={12} fill="currentColor" />
                                                    Simular
                                                </button>
                                            </div>
                                            <div className="h-80 w-full bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative">
                                                <AutomatonEditor
                                                    data={ex.respostaAutomato}
                                                    onChange={() => { }}
                                                    readOnly={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};