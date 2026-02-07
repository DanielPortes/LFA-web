import { useState, useMemo, useEffect, useId, useCallback } from 'react';
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
    Quote,
    AlertTriangle,
    Calculator,
    ArrowDown,
    Maximize2,
    CircleCheck,
    Circle,
    RotateCcw
} from 'lucide-react';
import { courseModules } from '../data/theoryData';
import type { ContentBlock, AutomatoData } from '../types';
import { AutomatonEditor, AutomatonPreview } from '../components/automaton';
import { DerivationTreeVisualizer, Modal } from '../components/ui';
import { useProgress } from '../hooks/useProgress';

interface ContentProps {
    onSimulate?: (data: AutomatoData) => void;
    initialModuleId?: string;
    initialLessonId?: string;
    onSelectionChange?: (moduleId: string, lessonId: string) => void;
}


// Renderiza Markdown básico: **negrito** → <strong>negrito</strong>
const renderMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const ContentBlockRenderer = ({ block, onSimulate, onExpand }: { block: ContentBlock, onSimulate?: (data: AutomatoData) => void, onExpand: (data: AutomatoData) => void }) => {
    switch (block.type) {
        case 'definition':
            return (
                <div className="my-8 p-6 glass-card border-l-[6px] border-l-ios-blue rounded-r-2xl animate-fade-in transition-all hover:shadow-apple-lg">
                    <h4 className="ui-kicker text-ios-blue mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Definição Formal
                    </h4>
                    <div className="text-lg font-medium text-primary whitespace-pre-line leading-relaxed">
                        {block.title && <strong className="block mb-2 text-2xl tracking-tight text-ios-blue dark:text-blue-300">{block.title}</strong>}
                        {typeof block.content === "string" ? renderMarkdown(block.content) : block.content}
                    </div>
                </div>
            );
        case 'theorem':
            return (
                <div className="my-8 relative overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-500/30 glass-card p-8 animate-fade-in">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ios-purple/50"></div>
                    <h4 className="ui-kicker text-ios-purple mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Teorema
                    </h4>
                    <div className="font-serif text-xl text-primary leading-relaxed">
                        {block.title && <strong className="block mb-2 not-italic font-sans font-bold text-2xl text-ios-purple dark:text-purple-300">{block.title}</strong>}
                        <span className="italic">{typeof block.content === "string" ? renderMarkdown(block.content) : block.content}</span>
                    </div>
                </div>
            );
        case 'note':
            return (
                <div className="my-6 p-5 glass-card rounded-xl border border-yellow-300/50 dark:border-yellow-700/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-yellow-700 dark:text-yellow-200 mb-1">{block.title || 'Nota do Professor'}</h4>
                        <p className="text-primary text-lg leading-relaxed">{typeof block.content === "string" ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'warning':
            return (
                <div className="my-6 p-5 rounded-xl border border-red-300/50 dark:border-red-500/30 glass-card flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-ios-red">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-ios-red dark:text-red-400 mb-1">
                            {block.title || 'Atenção!'}
                        </h4>
                        <p className="text-primary leading-relaxed">{typeof block.content === "string" ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'math-tip':
            return (
                <div className="my-6 p-5 rounded-xl border border-indigo-300/50 dark:border-indigo-500/30 glass-card flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-ios-indigo">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-ios-indigo dark:text-indigo-400 mb-1">
                            {block.title || 'Matematiquês'}
                        </h4>
                        <p className="text-primary font-mono text-sm leading-relaxed whitespace-pre-line">
                            {typeof block.content === "string" ? renderMarkdown(block.content) : block.content}
                        </p>
                    </div>
                </div>
            );
        case 'algorithm':
            return (
                <div className="my-8 glass-card rounded-2xl p-6 border border-default animate-fade-in">
                    <h4 className="ui-title-4 text-primary mb-6 flex items-center gap-3">
                        <div className="p-2 bg-ios-green/10 rounded-lg text-ios-green">
                            <ListOrdered size={20} />
                        </div>
                        {block.title || 'Algoritmo'}
                    </h4>
                    <div className="space-y-4">
                        {Array.isArray(block.content) ? block.content.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/20 flex items-center justify-center font-bold text-sm text-secondary font-mono">
                                    {idx + 1}
                                </div>
                                <p className="pt-1 text-lg text-secondary">{renderMarkdown(step)}</p>
                            </div>
                        )) : <p>{typeof block.content === "string" ? renderMarkdown(block.content) : block.content}</p>}
                    </div>
                </div>
            );
        case 'example':
            return (
                <div className="my-10 animate-fade-in group">
                    <div className="glass-card overflow-hidden border-2 border-transparent hover:border-ios-blue/20 transition-all duration-300">
                        <div className="p-6 md:p-8 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
                            <div className="flex justify-between items-start mb-6">
                            <h4 className="ui-kicker text-secondary flex items-center gap-2">
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

                            {block.title && <h5 className="text-2xl font-bold mb-4 text-primary">{block.title}</h5>}

                            <div className="text-secondary text-lg leading-relaxed mb-8 whitespace-pre-line">
                                {typeof block.content === "string" ? renderMarkdown(block.content) : block.content}
                            </div>

                            <div className={`grid gap-6 ${block.automatoRef2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                {block.automatoRef && (
                                    <div className="flex flex-col gap-3">
                                        {block.automatoRef2 && <div className="ui-kicker text-secondary text-center">Antes</div>}
                                        <div className="h-72 bg-canvas rounded-2xl border border-default overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                                            <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onExpand(block.automatoRef!)}
                                                    className="p-2 bg-surface-2 hover:bg-surface-1 text-primary rounded-lg backdrop-blur-sm transition-colors border border-default"
                                                    title="Expandir visualização"
                                                    aria-label="Expandir visualização do autômato"
                                                >
                                                    <Maximize2 size={16} />
                                                </button>
                                            </div>
                                            <AutomatonPreview data={block.automatoRef} />
                                        </div>
                                    </div>
                                )}

                                {block.automatoRef2 && (
                                    <>
                                        <div className="md:hidden flex justify-center text-muted"><ArrowDown /></div>
                                        <div className="flex flex-col gap-3">
                                            <div className="ui-kicker text-ios-green text-center">Depois</div>
                                            <div className="h-72 bg-canvas rounded-2xl border-2 border-ios-green/20 overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                                                <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onExpand(block.automatoRef2!)}
                                                    className="p-2 bg-surface-2 hover:bg-surface-1 text-primary rounded-lg backdrop-blur-sm transition-colors border border-default"
                                                    title="Expandir visualização"
                                                    aria-label="Expandir visualização do autômato"
                                                >
                                                    <Maximize2 size={16} />
                                                </button>
                                                </div>
                                                <AutomatonPreview data={block.automatoRef2} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'list':
            return (
                <div className="my-8">
                    {block.title && <h4 className="ui-title-4 text-primary mb-4 animate-fade-in">{block.title}</h4>}
                    <ul className="grid gap-3">
                        {(block.content as string[]).map((item, idx) => (
                            <li 
                                key={idx} 
                                className="flex items-start gap-4 text-secondary glass-card p-4 rounded-xl border border-default hover:border-ios-blue/30 transition-colors animate-slide-in-up opacity-0"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
                            >
                                <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-ios-blue flex-shrink-0" />
                                <span className="leading-relaxed font-medium text-lg">{renderMarkdown(item)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        case 'interactive-grammar':
            return (
                <div className="my-10 animate-fade-in">
                    <div className="glass-card overflow-hidden border border-default">
                        <div className="p-6 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
                            <h4 className="ui-kicker text-secondary flex items-center gap-2 mb-4">
                                <LayoutList size={18} />
                                Visualização Interativa
                            </h4>
                            {block.title && <h5 className="text-2xl font-bold mb-4 text-primary">{block.title}</h5>}
                            {block.content && <p className="text-secondary mb-6">{typeof block.content === "string" ? renderMarkdown(block.content) : block.content}</p>}
                            
                            {block.grammarTreeData && (
                                <div className="rounded-xl border border-default bg-surface-1 overflow-hidden">
                                    <DerivationTreeVisualizer tree={block.grammarTreeData} autoPlay={false} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        default:
            return (
                <div className="my-6 text-primary leading-8 text-lg animate-fade-in whitespace-pre-line text-justify font-medium">
                    {typeof block.content === "string" ? renderMarkdown(block.content) : block.content}
                </div>
            );
    }
};

export const ConteudoSection = ({ onSimulate, initialModuleId, initialLessonId, onSelectionChange }: ContentProps) => {
    const getModuleById = useCallback((moduleId?: string) =>
        courseModules.find(m => m.id === moduleId) ?? courseModules[0], []);
    const getLessonById = useCallback((moduleId?: string, lessonId?: string) => {
        const mod = getModuleById(moduleId);
        return mod.lessons.find(l => l.id === lessonId) ?? mod.lessons[0];
    }, [getModuleById]);

    const initialModule = getModuleById(initialModuleId);
    const initialLesson = getLessonById(initialModule.id, initialLessonId);

    const [activeModuleId, setActiveModuleId] = useState(initialModule.id);
    const [activeLessonId, setActiveLessonId] = useState(initialLesson.id);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAutomaton, setSelectedAutomaton] = useState<AutomatoData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const sidebarId = useId();

    const {
        progress,
        isLessonCompleted,
        markLessonVisited,
        markLessonCompleted,
        getProgressPercentage,
        resetProgress
    } = useProgress();

    // Calculate total lessons count
    const totalLessons = useMemo(() =>
        courseModules.reduce((sum, mod) => sum + mod.lessons.length, 0),
        []
    );

    const activeModule = useMemo(() =>
        courseModules.find(m => m.id === activeModuleId) ?? courseModules[0],
        [activeModuleId]);

    const activeLesson = useMemo(() =>
        activeModule.lessons.find(l => l.id === activeLessonId) ?? activeModule.lessons[0],
        [activeModule, activeLessonId]);

    const filteredModules = useMemo(() => {
        if (!searchQuery.trim()) return courseModules;
        const query = searchQuery.trim().toLowerCase();
        return courseModules
            .map(module => ({
                ...module,
                lessons: module.lessons.filter(lesson =>
                    lesson.title.toLowerCase().includes(query)
                    || lesson.description.toLowerCase().includes(query)
                )
            }))
            .filter(module => module.lessons.length > 0);
    }, [searchQuery]);

    useEffect(() => {
        document.getElementById('main-content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeLessonId]);

    useEffect(() => {
        const nextModule = getModuleById(initialModuleId);
        const nextLesson = getLessonById(nextModule.id, initialLessonId);
        setActiveModuleId(prev => (prev === nextModule.id ? prev : nextModule.id));
        setActiveLessonId(prev => (prev === nextLesson.id ? prev : nextLesson.id));
    }, [initialModuleId, initialLessonId, getModuleById, getLessonById]);

    useEffect(() => {
        markLessonVisited(activeLessonId);
        onSelectionChange?.(activeModuleId, activeLessonId);
    }, [activeLessonId, activeModuleId, markLessonVisited, onSelectionChange]);

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

    const lastVisitedLesson = progress.lastVisited
        ? courseModules
            .flatMap(m => m.lessons.map(l => ({ moduleId: m.id, lesson: l })))
            .find(({ lesson }) => lesson.id === progress.lastVisited)
        : null;

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if (!isSidebarOpen || window.innerWidth >= 768) return undefined;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isSidebarOpen) return undefined;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [isSidebarOpen]);

    return (
        <div className="relative flex w-full min-w-0 min-h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-9.5rem)] gap-4 md:gap-6 md:pb-4">
            <div className="md:hidden fixed bottom-6 right-6 z-[60]">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    aria-expanded={isSidebarOpen}
                    aria-controls={sidebarId}
                    aria-label={isSidebarOpen ? 'Fechar menu de conteúdo' : 'Abrir menu de conteúdo'}
                    className="bg-ios-blue text-white p-4 rounded-full shadow-apple-xl flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                >
                    {isSidebarOpen ? <X size={24} /> : <ListFilter size={24} />}
                </button>
            </div>

            {isSidebarOpen && (
                <button
                    className="md:hidden fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Fechar menu de conteúdo"
                />
            )}

            <aside className={`
                fixed md:relative top-[5.5rem] bottom-0 md:top-auto md:bottom-auto left-0 z-40 w-[88vw] max-w-[22rem]
                md:w-[22rem] md:max-w-[22rem] md:min-w-[22rem]
                ${isSidebarOpen ? 'bg-surface-1-95 backdrop-blur-2xl' : 'bg-transparent'}
                md:bg-transparent md:backdrop-blur-none
                border-r border-default md:border-r-0
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col md:h-full
            `} id={sidebarId}>
                <div className="glass-panel rounded-3xl h-full min-w-0 flex flex-col overflow-hidden shadow-apple-md">
                    <div className="p-6 border-b border-default bg-surface-1/80 backdrop-blur-md sticky top-0 z-20 rounded-t-3xl">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-ios-green" />
                            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.2em]">DCC063 • LFA</h2>
                        </div>
                        <div className="text-2xl font-bold text-primary flex items-center gap-3">
                            <GraduationCap size={28} className="text-ios-blue" />
                            Material P1
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-secondary font-medium">Progresso</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-ios-green font-bold">{getProgressPercentage(totalLessons)}%</span>
                                    <button
                                        onClick={resetProgress}
                                        className="p-1 text-secondary hover:text-ios-red transition-colors"
                                        title="Resetar progresso"
                                        aria-label="Resetar progresso"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-ios-green via-emerald-500 to-ios-teal rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,199,89,0.4)]"
                                    style={{ width: `${getProgressPercentage(totalLessons)}%` }}
                                />
                            </div>
                        </div>

                        {lastVisitedLesson && lastVisitedLesson.lesson.id !== activeLessonId && (
                            <button
                                onClick={() => handleNavigate(lastVisitedLesson.moduleId, lastVisitedLesson.lesson.id)}
                                className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-status-info bg-status-info-soft border border-status-info hover:bg-ios-blue hover:text-white transition-colors"
                            >
                                Continuar de onde parei
                            </button>
                        )}

                        <div className="mt-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar lição..."
                                aria-label="Buscar lição"
                                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-default text-sm font-medium text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 pb-6">
                        {filteredModules.map((module, modIdx) => (
                            <div key={module.id} className="mb-6 last:mb-0">
                                <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-surface-1/90 backdrop-blur z-10 border-b border-transparent rounded-lg">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-secondary font-mono">
                                        {modIdx + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-primary leading-tight">
                                        {module.title.replace(/^Módulo \d+: /, '')}
                                    </h3>
                                </div>

                                <div className="mt-1 space-y-1 px-2 relative">
                                    <div className="absolute left-7 top-2 bottom-2 w-px bg-black/5 dark:bg-white/5 -z-10"></div>

                                    {module.lessons.map(lesson => {
                                        const isActive = lesson.id === activeLessonId;
                                        const isCompleted = isLessonCompleted(lesson.id);
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleNavigate(module.id, lesson.id)}
                                                className={`group w-full text-left pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden flex items-start gap-2
                                                    ${isActive
                                                        ? 'text-status-info bg-status-info-soft font-bold shadow-sm'
                                                        : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ios-blue rounded-r-full"></div>}
                                                <span className="flex-1 leading-snug py-0.5">{lesson.title}</span>
                                                {isCompleted ? (
                                                    <CircleCheck size={14} strokeWidth={3} className="text-ios-green flex-shrink-0 mt-1" />
                                                ) : (
                                                    <Circle size={14} className="text-secondary flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredModules.length === 0 && (
                            <div className="px-4 py-6 text-xs text-muted">
                                Nenhuma lição encontrada para essa busca.
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main
                id="main-content-scroll"
                className="flex-1 min-w-0 overflow-y-auto custom-scrollbar scroll-smooth rounded-2xl md:rounded-3xl glass-panel border border-transparent md:border-default pb-10"
            >
                <div className="max-w-6xl mx-auto py-10 px-6 md:px-12 pb-32">
                    <header className="mb-12 animate-fade-in glass-card p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-2 ui-kicker text-secondary mb-6">
                            <span className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">Módulo {courseModules.findIndex(m => m.id === activeModuleId) + 1}</span>
                            <ChevronRight size={10} />
                            <span className="text-ios-blue">{activeModule.title}</span>
                        </div>

                        <h1 className="ui-title-1 text-primary mb-6">
                            {activeLesson.title}
                        </h1>

                        <div className="flex items-start gap-4 ui-body-lg text-secondary border-l-4 border-ios-blue/30 pl-6 py-2 font-medium italic glass-card rounded-r-xl p-4">
                            <Quote className="text-muted flex-shrink-0" size={24} />
                            {activeLesson.description}
                        </div>
                    </header>

                    <div className="space-y-2">
                        {activeLesson.content.map((block, idx) => (
                            <ContentBlockRenderer
                                key={idx}
                                block={block}
                                onSimulate={onSimulate}
                                onExpand={setSelectedAutomaton}
                            />
                        ))}
                    </div>

                    <div className="mt-24 pt-8 border-t border-default">
                        {/* Mark as Complete button */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => markLessonCompleted(activeLessonId)}
                                disabled={isLessonCompleted(activeLessonId)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-sm
                                    ${isLessonCompleted(activeLessonId)
                                        ? 'bg-ios-green/10 text-ios-green cursor-default'
                                        : 'bg-ios-green text-white hover:bg-green-600 shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isLessonCompleted(activeLessonId) ? (
                                    <>
                                        <CircleCheck size={20} strokeWidth={3} />
                                        Lição Concluída
                                    </>
                                ) : (
                                    <>
                                        <Circle size={20} />
                                        Marcar como Concluída
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => navigationState.prev && handleNavigate(navigationState.prev.modId, navigationState.prev.lessonId)}
                                disabled={!navigationState.prev}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all
                                    ${navigationState.prev
                                        ? 'text-primary hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer'
                                        : 'text-secondary opacity-50 cursor-not-allowed'}`}
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
                                        : 'bg-black/5 dark:bg-white/10 text-secondary opacity-50 cursor-not-allowed'}`}
                            >
                                <span className="font-bold">Próxima Lição</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={!!selectedAutomaton}
                onClose={() => setSelectedAutomaton(null)}
                title={selectedAutomaton?.tipo || 'Visualização do Autômato'}
                className="h-[80vh]"
            >
                {selectedAutomaton && (
                    <div className="h-full w-full bg-canvas rounded-xl border border-default overflow-hidden relative shadow-inner">
                        <AutomatonEditor
                            data={selectedAutomaton}
                            onChange={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};



