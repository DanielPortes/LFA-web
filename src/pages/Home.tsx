import {Info, Move, Calendar, Clock, MapPin, ChevronRight, Play, Code} from 'lucide-react';
import type { Tab } from '../types';

export const HomeSection = ({ onNavigate }: { onNavigate: (t: Tab) => void }) => (
    <div className="animate-fade-in space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[32px] bg-black text-white shadow-apple-xl group min-h-[400px] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1e] to-black"></div>

            {/* Subtle animated background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-600/30 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 group-hover:bg-purple-600/30 transition-all duration-1000"></div>

            <div className="relative p-12 w-full z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> DCC063 • 2025
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.05]">
                        Linguagens <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Formais.</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg font-medium">
                        Explore o universo dos autômatos. Teoria completa, exercícios desafiadores e um simulador visual de alta performance.
                    </p>
                    <button
                        onClick={() => onNavigate('simulador')}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-3"
                    >
                        <Play fill="currentColor" size={18} />
                        Começar a Simular
                    </button>
                </div>

                {/* Decorative Graphic */}
                <div className="hidden md:flex relative w-80 h-80 items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                    <div className="glass-panel w-24 h-24 rounded-full flex items-center justify-center z-20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <Code className="text-white" size={32} />
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Info Card */}
            <div className="col-span-1 glass-card p-8 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-ios-blue">
                            <Info size={20} />
                        </div>
                        Informações
                    </h3>
                    <ul className="space-y-4">
                        {[
                            { icon: MapPin, t: "Sala 308", s: "Bloco C" },
                            { icon: Clock, t: "Seg/Qua 14h", s: "Teoria" },
                            { icon: Calendar, t: "Qui 14h", s: "Prática" }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <div className="text-gray-400 group-hover:text-ios-blue transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <span className="block font-semibold text-sm text-[var(--text-primary)]">{item.t}</span>
                                    <span className="text-xs text-gray-500">{item.s}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Timeline */}
            <div className="md:col-span-2 glass-card p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-ios-purple">
                        <Move size={20} />
                    </div>
                    Cronograma
                </h3>

                <div className="relative flex justify-between items-center px-8">
                    <div className="absolute left-12 right-12 h-0.5 bg-gray-200 dark:bg-white/10 top-[18px] -z-10" />
                    {[
                        { l: 'Intro', d: 'Concluído', s: 'done' },
                        { l: 'Prova 1', d: '24/11', s: 'active' },
                        { l: 'Prova 2', d: '12/01', s: 'next' },
                        { l: 'Final', d: '20/01', s: 'next' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 relative group">
                            <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shadow-lg transition-all duration-300 z-10 ${
                                item.s === 'done' ? 'bg-ios-green border-ios-bg-light dark:border-ios-bg-dark text-white scale-100' :
                                    item.s === 'active' ? 'bg-ios-blue border-ios-bg-light dark:border-ios-bg-dark text-white ring-4 ring-blue-500/20 scale-110' :
                                        'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                                {item.s === 'done' && <ChevronRight size={16} strokeWidth={4} />}
                                {item.s !== 'done' && <div className={`w-2 h-2 rounded-full ${item.s === 'active' ? 'bg-white animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />}
                            </div>
                            <div className="text-center">
                                <span className={`block text-sm font-bold mb-1 ${item.s === 'active' ? 'text-ios-blue' : 'text-gray-500'}`}>{item.l}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{item.d}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);