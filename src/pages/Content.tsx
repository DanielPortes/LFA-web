import { useState, useMemo, useEffect } from 'react';
import {
    ChevronRight,
    BookOpen,
    CheckCircle,
    X,
    ArrowRight,
    ArrowLeft,
    Play,
    LayoutList,
    ListFilter,
    GraduationCap,
    Lightbulb,
    ListOrdered,
    Quote
} from 'lucide-react';
import { courseModules } from '../data/theoryData';
import type { ContentBlock, AutomatoData } from '../types';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';

interface ContentProps {
    onSimulate?: (data: AutomatoData) => void;
}

// --- Renderizador de Conteúdo Rico ---
const ContentBlockRenderer = ({ block, onSimulate }: { block: ContentBlock, onSimulate?: (data: AutomatoData) => void }) => {
    switch (block.type) {
        case 'definition':
            return (
                <div className="my-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 border-l-[6px] border-ios-blue rounded-r-2xl animate-fade-in transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <h4 className="text-xs font-black text-ios-blue uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Definição Formal
                    </h4>
                    <div className="text-lg font-medium text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                        {block.title && <strong className="block mb-2 text-2xl tracking-tight text-ios-blue dark:text-blue-300">{block.title}</strong>}
                        {block.content}
                    </div>
                </div>
            );
        case 'theorem':
            return (
                <div className="my-8 relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 dark:to-transparent p-8 shadow-sm animate-fade-in">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ios-purple/50"></div>
                    <h4 className="text-xs font-black text-ios-purple uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Teorema
                    </h4>
                    <div className="font-serif text-xl text-[var(--text-primary)] leading-relaxed">
                        {block.title && <strong className="block mb-2 not-italic font-sans font-bold text-2xl text-ios-purple dark:text-purple-300">{block.title}</strong>}
                        <span className="italic">{block.content}</span>
                    </div>
                </div>
            );
        case 'note':
            return (
                <div className="my-6 p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-700/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wider mb-1">{block.title || 'Nota do Professor'}</h4>
                        <p className="text-yellow-900 dark:text-yellow-100 text-lg leading-relaxed">{block.content}</p>
                    </div>
                </div>
            );
        case 'algorithm':
            return (
                <div className="my-8 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 animate-fade-in">
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                        <div className="p-2 bg-ios-green/10 rounded-lg text-ios-green">
                            <ListOrdered size={20} />
                        </div>
                        {block.title || 'Algoritmo'}
                    </h4>
                    <div className="space-y-4">
                        {Array.isArray(block.content) ? block.content.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center font-bold text-sm text-gray-500 font-mono">
                                    {idx + 1}
                                </div>
                                <p className="pt-1 text-lg text-[var(--text-secondary)]">{step}</p>
                            </div>
                        )) : <p>{block.content}</p>}
                    </div>
                </div>
            );
        case 'example':
            return (
                <div className="my-10 animate-fade-in group">
                    <div className="glass-card overflow-hidden border-2 border-transparent hover:border-ios-blue/20 transition-all duration-300">
                        <div className="p-6 md:p-8 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <LayoutList size={18} />
                                    Exemplo Prático
                                </h4>

                                {block.automatoRef && onSimulate && (
                                    <button
                                        onClick={() => onSimulate(block.automatoRef!)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                    >
                                        <Play size={12} fill="currentColor" />
                                        SIMULAR
                                    </button>
                                )}
                            </div>

                            {block.title && <h5 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">{block.title}</h5>}

                            <div className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8 whitespace-pre-line">
                                {block.content}
                            </div>

                            {block.automatoRef && (
                                <div className="h-72 bg-[var(--canvas-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden relative shadow-inner cursor-default group-hover:shadow-md transition-shadow">
                                    <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-black/10 dark:bg-white/10 backdrop-blur rounded text-[10px] font-mono text-gray-500">
                                        Visualização Estática
                                    </div>
                                    <AutomatonEditor
                                        data={block.automatoRef}
                                        onChange={() => {}}
                                        readOnly={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        case 'list':
            return (
                <div className="my-8 animate-fade-in">
                    {block.title && <h4 className="font-bold text-xl mb-4 text-[var(--text-primary)]">{block.title}</h4>}
                    <ul className="grid gap-3">
                        {(block.content as string[]).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 text-[var(--text-secondary)] bg-white dark:bg-white/5 p-4 rounded-xl border border-[var(--border-color)] hover:border-ios-blue/30 transition-colors">
                                <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-ios-blue flex-shrink-0" />
                                <span className="leading-relaxed font-medium text-lg">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        default:
            return (
                <div className="my-6 text-[var(--text-primary)] leading-8 text-lg animate-fade-in whitespace-pre-line text-justify font-medium">
                    {block.content}
                </div>
            );
    }
};

export const ConteudoSection = ({ onSimulate }: ContentProps) => {
    const [activeModuleId, setActiveModuleId] = useState(courseModules[0].id);
    const [activeLessonId, setActiveLessonId] = useState(courseModules[0].lessons[0].id);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const activeModule = useMemo(() =>
            courseModules.find(m => m.id === activeModuleId)!,
        [activeModuleId]);

    const activeLesson = useMemo(() =>
            activeModule.lessons.find(l => l.id === activeLessonId)!,
        [activeModule, activeLessonId]);

    // Scroll to top when lesson changes
    useEffect(() => {
        document.getElementById('main-content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeLessonId]);

    // Lógica de Navegação
    const navigationState = useMemo(() => {
        const modIndex = courseModules.findIndex(m => m.id === activeModuleId);
        const lessonIndex = activeModule.lessons.findIndex(l => l.id === activeLessonId);

        let prev = null;
        let next = null;

        if (lessonIndex > 0) {
            prev = { modId: activeModuleId, lessonId: activeModule.lessons[lessonIndex - 1].id };
        } else if (modIndex > 0) {
            const prevMod = courseModules[modIndex - 1];
            prev = { modId: prevMod.id, lessonId: prevMod.lessons[prevMod.lessons.length - 1].id };
        }

        if (lessonIndex < activeModule.lessons.length - 1) {
            next = { modId: activeModuleId, lessonId: activeModule.lessons[lessonIndex + 1].id };
        } else if (modIndex < courseModules.length - 1) {
            const nextMod = courseModules[modIndex + 1];
            next = { modId: nextMod.id, lessonId: nextMod.lessons[0].id };
        }

        return { prev, next };
    }, [activeModuleId, activeLessonId, activeModule]);

    const handleNavigate = (modId: string, lessonId: string) => {
        setActiveModuleId(modId);
        setActiveLessonId(lessonId);
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] relative overflow-hidden">

            {/* Mobile Toggle */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="bg-ios-blue text-white p-4 rounded-full shadow-apple-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                    {isSidebarOpen ? <X size={24} /> : <ListFilter size={24} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`
                fixed md:relative inset-y-0 left-0 z-40 w-80 
                bg-[var(--bg-card)]/95 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none
                border-r border-[var(--border-color)] md:border-r-0
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col h-full shadow-2xl md:shadow-none
            `}>
                <div className="md:glass-panel md:rounded-3xl h-full flex flex-col overflow-hidden shadow-sm md:mr-4 bg-white/50 dark:bg-black/20">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-[var(--border-color)] bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">DCC063 • LFA</h2>
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            <GraduationCap size={28} className="text-ios-blue"/>
                            Material P1
                        </div>
                    </div>

                    {/* Sidebar Content List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-20">
                        {courseModules.map((module, modIdx) => (
                            <div key={module.id} className="mb-6 last:mb-0">
                                {/* Module Title */}
                                <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur z-10 border-b border-transparent rounded-t-xl">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 font-mono">
                                        {modIdx}
                                    </span>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                                        {module.title.replace(/^Módulo \d+: /, '')}
                                    </h3>
                                </div>

                                {/* Lessons List */}
                                <div className="mt-1 space-y-1 px-2 relative">
                                    {/* Guide Line */}
                                    <div className="absolute left-7 top-2 bottom-2 w-px bg-gray-200 dark:bg-white/5 -z-10"></div>

                                    {module.lessons.map(lesson => {
                                        const isActive = lesson.id === activeLessonId;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleNavigate(module.id, lesson.id)}
                                                className={`group w-full text-left pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                                    ${isActive
                                                    ? 'text-ios-blue bg-blue-50 dark:bg-blue-900/20 font-bold shadow-sm'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ios-blue"></div>}
                                                <span className="truncate block">{lesson.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                id="main-content-scroll"
                className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth rounded-3xl bg-white/50 dark:bg-black/20 border border-transparent md:border-[var(--border-color)]"
            >
                <div className="max-w-4xl mx-auto py-10 px-6 md:px-12 pb-32">
                    {/* Header */}
                    <header className="mb-12 animate-fade-in">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">Módulo {courseModules.findIndex(m => m.id === activeModuleId)}</span>
                            <ChevronRight size={10} />
                            <span className="text-ios-blue">{activeModule.title}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight leading-[1.1]">
                            {activeLesson.title}
                        </h1>

                        <div className="flex items-start gap-4 text-xl text-[var(--text-secondary)] leading-relaxed border-l-4 border-ios-blue/30 pl-6 py-2 font-medium italic bg-gray-50 dark:bg-white/5 rounded-r-xl p-4">
                            <Quote className="text-gray-300 flex-shrink-0" size={24} />
                            {activeLesson.description}
                        </div>
                    </header>

                    {/* Content Blocks */}
                    <div className="space-y-2">
                        {activeLesson.content.map((block, idx) => (
                            <ContentBlockRenderer key={idx} block={block} onSimulate={onSimulate} />
                        ))}
                    </div>

                    {/* Navigation Footer */}
                    <div className="mt-24 pt-8 border-t border-[var(--border-color)] flex justify-between items-center">
                        <button
                            onClick={() => navigationState.prev && handleNavigate(navigationState.prev.modId, navigationState.prev.lessonId)}
                            disabled={!navigationState.prev}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all
                                ${navigationState.prev
                                ? 'text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer'
                                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}
                        >
                            <ArrowLeft size={20} />
                            <span className="font-bold hidden sm:inline">Anterior</span>
                        </button>

                        <button
                            onClick={() => navigationState.next && handleNavigate(navigationState.next.modId, navigationState.next.lessonId)}
                            disabled={!navigationState.next}
                            className={`flex items-center gap-3 px-8 py-4 rounded-full transition-all shadow-lg
                                ${navigationState.next
                                ? 'bg-ios-blue hover:bg-blue-600 text-white cursor-pointer hover:scale-105 active:scale-95'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                        >
                            <span className="font-bold">Próxima Lição</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};