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
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';
import { AutomatonPreview } from '../components/automaton/AutomatonPreview';
import { Modal } from '../components/ui/Modal';
import { useProgress } from '../hooks/useProgress';

interface ContentProps {
    onSimulate?: (data: AutomatoData) => void;
    initialModuleId?: string;
    initialLessonId?: string;
    onSelectionChange?: (moduleId: string, lessonId: string) => void;
}

const ContentBlockRenderer = ({ block, onSimulate, onExpand }: { block: ContentBlock, onSimulate?: (data: AutomatoData) => void, onExpand: (data: AutomatoData) => void }) => {
    switch (block.type) {
        case 'definition':
            return (
                <div className="my-8 p-6 glass-card border-l-[6px] border-ios-blue rounded-r-2xl animate-fade-in transition-all hover:bg-white/40 dark:hover:bg-white/10">
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
                <div className="my-8 relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-500/30 glass-card p-8 shadow-sm animate-fade-in">
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
                <div className="my-6 p-5 glass-card rounded-xl border border-yellow-200 dark:border-yellow-700/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wider mb-1">{block.title || 'Nota do Professor'}</h4>
                        <p className="text-yellow-900 dark:text-yellow-100 text-lg leading-relaxed">{block.content}</p>
                    </div>
                </div>
            );
        case 'warning':
            return (
                <div className="my-6 p-5 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-500/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase tracking-wider mb-1">
                            {block.title || 'Atenção!'}
                        </h4>
                        <p className="text-red-800 dark:text-red-200 leading-relaxed">{block.content}</p>
                    </div>
                </div>
            );
        case 'math-tip':
            return (
                <div className="my-6 p-5 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-500/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-indigo-500">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 text-sm uppercase tracking-wider mb-1">
                            {block.title || 'Matematiquês'}
                        </h4>
                        <p className="text-indigo-900 dark:text-indigo-200 font-mono text-sm leading-relaxed whitespace-pre-line">
                            {block.content}
                        </p>
                    </div>
                </div>
            );
        case 'algorithm':
            return (
                <div className="my-8 glass-card rounded-2xl p-6 border border-[var(--border-color)] animate-fade-in">
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
                                <h4 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
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

                            <div className={`grid gap-6 ${block.automatoRef2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                {block.automatoRef && (
                                    <div className="flex flex-col gap-3">
                                        {block.automatoRef2 && <div className="text-center font-bold text-gray-600 text-xs uppercase tracking-widest">Antes</div>}
                                        <div className="h-72 bg-[var(--canvas-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                                            <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onExpand(block.automatoRef!)}
                                                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                    title="Expandir visualização"
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
                                        <div className="md:hidden flex justify-center text-gray-300"><ArrowDown /></div>
                                        <div className="flex flex-col gap-3">
                                            <div className="text-center font-bold text-ios-green text-xs uppercase tracking-widest">Depois</div>
                                            <div className="h-72 bg-[var(--canvas-bg)] rounded-2xl border-2 border-ios-green/20 overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                                            <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onExpand(block.automatoRef2!)}
                                                        className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                        title="Expandir visualização"
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
                <div className="my-8 animate-fade-in">
                    {block.title && <h4 className="font-bold text-xl mb-4 text-[var(--text-primary)]">{block.title}</h4>}
                    <ul className="grid gap-3">
                        {(block.content as string[]).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 text-[var(--text-secondary)] glass-card p-4 rounded-xl border border-[var(--border-color)] hover:border-ios-blue/30 transition-colors">
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

export const ConteudoSection = ({ onSimulate, initialModuleId, initialLessonId, onSelectionChange }: ContentProps) => {
    const getModuleById = (moduleId?: string) =>
        courseModules.find(m => m.id === moduleId) ?? courseModules[0];
    const getLessonById = (moduleId?: string, lessonId?: string) => {
        const mod = getModuleById(moduleId);
        return mod.lessons.find(l => l.id === lessonId) ?? mod.lessons[0];
    };

    const initialModule = getModuleById(initialModuleId);
    const initialLesson = getLessonById(initialModule.id, initialLessonId);

    const [activeModuleId, setActiveModuleId] = useState(initialModule.id);
    const [activeLessonId, setActiveLessonId] = useState(initialLesson.id);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAutomaton, setSelectedAutomaton] = useState<AutomatoData | null>(null);

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

    useEffect(() => {
        document.getElementById('main-content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeLessonId]);

    useEffect(() => {
        const nextModule = getModuleById(initialModuleId);
        const nextLesson = getLessonById(nextModule.id, initialLessonId);
        setActiveModuleId(nextModule.id);
        setActiveLessonId(nextLesson.id);
    }, [initialModuleId, initialLessonId]);

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

    return (
        <div className="flex h-[calc(100vh-8rem)] relative overflow-hidden">
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="bg-ios-blue text-white p-4 rounded-full shadow-apple-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                    {isSidebarOpen ? <X size={24} /> : <ListFilter size={24} />}
                </button>
            </div>

            <aside className={`
                fixed md:relative inset-y-0 left-0 z-40 w-80 
                bg-[var(--bg-card)]/95 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none
                border-r border-[var(--border-color)] md:border-r-0
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col h-full shadow-2xl md:shadow-none
            `}>
                <div className="md:glass-panel md:rounded-3xl h-full flex flex-col overflow-hidden shadow-sm md:mr-4 bg-white/70 dark:bg-black/20">
                    <div className="p-6 border-b border-[var(--border-color)] bg-white/50 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
                            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">DCC063 • LFA</h2>
                        </div>
                        <div className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            <GraduationCap size={28} className="text-ios-blue" />
                            Material P1
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-600 font-medium">Progresso</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-ios-green font-bold">{getProgressPercentage(totalLessons)}%</span>
                                    <button
                                        onClick={resetProgress}
                                        className="p-1 text-gray-600 hover:text-ios-red transition-colors"
                                        title="Resetar progresso"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-ios-green to-ios-teal rounded-full transition-all duration-500"
                                    style={{ width: `${getProgressPercentage(totalLessons)}%` }}
                                />
                            </div>
                        </div>

                        {lastVisitedLesson && lastVisitedLesson.lesson.id !== activeLessonId && (
                            <button
                                onClick={() => handleNavigate(lastVisitedLesson.moduleId, lastVisitedLesson.lesson.id)}
                                className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-ios-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                Continuar de onde parei
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-20">
                        {courseModules.map((module, modIdx) => (
                            <div key={module.id} className="mb-6 last:mb-0">
                                <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur z-10 border-b border-transparent rounded-t-xl">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 font-mono">
                                        {modIdx + 1}
                                    </span>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                                        {module.title.replace(/^Módulo \d+: /, '')}
                                    </h3>
                                </div>

                                <div className="mt-1 space-y-1 px-2 relative">
                                    <div className="absolute left-7 top-2 bottom-2 w-px bg-gray-200 dark:bg-white/5 -z-10"></div>

                                    {module.lessons.map(lesson => {
                                        const isActive = lesson.id === activeLessonId;
                                        const isCompleted = isLessonCompleted(lesson.id);
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleNavigate(module.id, lesson.id)}
                                                className={`group w-full text-left pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden flex items-center gap-2
                                                    ${isActive
                                                        ? 'text-ios-blue bg-blue-50/50 dark:bg-blue-900/20 font-bold shadow-sm'
                                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ios-blue"></div>}
                                                <span className="truncate flex-1">{lesson.title}</span>
                                                {isCompleted ? (
                                                    <CircleCheck size={14} className="text-ios-green flex-shrink-0" />
                                                ) : (
                                                    <Circle size={14} className="text-gray-600 dark:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <main
                id="main-content-scroll"
                className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth rounded-3xl glass-panel border border-transparent md:border-[var(--border-color)]"
            >
                <div className="max-w-4xl mx-auto py-10 px-6 md:px-12 pb-32">
                    <header className="mb-12 animate-fade-in">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">
                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">Módulo {courseModules.findIndex(m => m.id === activeModuleId) + 1}</span>
                            <ChevronRight size={10} />
                            <span className="text-ios-blue">{activeModule.title}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight leading-[1.1]">
                            {activeLesson.title}
                        </h1>

                        <div className="flex items-start gap-4 text-xl text-[var(--text-secondary)] leading-relaxed border-l-4 border-ios-blue/30 pl-6 py-2 font-medium italic glass-card rounded-r-xl p-4">
                            <Quote className="text-gray-300 flex-shrink-0" size={24} />
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

                    <div className="mt-24 pt-8 border-t border-[var(--border-color)]">
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
                                        <CircleCheck size={20} />
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
                                        ? 'text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer'
                                        : 'text-gray-600 dark:text-gray-600 cursor-not-allowed'}`}
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
                </div>
            </main>

            <Modal
                isOpen={!!selectedAutomaton}
                onClose={() => setSelectedAutomaton(null)}
                title={selectedAutomaton?.tipo || 'Visualização do Autômato'}
                className="h-[80vh]"
            >
                {selectedAutomaton && (
                    <div className="h-full w-full bg-[var(--canvas-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden relative shadow-inner">
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
