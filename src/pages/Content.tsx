import { ArrowUpRight } from 'lucide-react';
import { topicos } from '../data/constants';

export const ConteudoSection = () => (
    <div className="max-w-6xl mx-auto pt-4 animate-fade-in">
        <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Material Didático</h2>
            <p className="text-lg text-[var(--text-secondary)]">Conceitos fundamentais organizados para estudo rápido.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicos.map((topic) => {
                const Icon = topic.icon;
                return (
                    <div key={topic.id} className="group relative overflow-hidden glass-card hover:shadow-apple-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20 opacity-0 group-hover:opacity-100"></div>

                        <button className="w-full h-full text-left p-8 flex flex-col relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 rounded-[18px] bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-ios-blue group-hover:scale-110 transition-all duration-300">
                                    <Icon size={26} strokeWidth={1.5} />
                                </div>
                                <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-300 group-hover:bg-ios-blue group-hover:border-transparent group-hover:text-white transition-all">
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-tight group-hover:text-ios-blue transition-colors">
                                {topic.title}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                {topic.desc}
                            </p>
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
);