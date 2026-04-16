import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState
} from 'react';
import { buildContentIndex, normalizeForSearch } from '../../data/contentIndex';
import type { AutomatoData, CourseModule, Lesson } from '../../types';

export interface ContentNavigationTarget {
    modId: string;
    lessonId: string;
}

export interface LastVisitedLesson {
    moduleId: string;
    lesson: Lesson;
}

interface UseContentSelectionParams {
    modules: CourseModule[];
    initialModuleId?: string;
    initialLessonId?: string;
    lastVisitedLessonId?: string | null;
    markLessonVisited: (lessonId: string) => void;
    onSelectionChange?: (moduleId: string, lessonId: string) => void;
    scrollContainerId?: string;
}

export const useContentSelection = ({
    modules,
    initialModuleId,
    initialLessonId,
    lastVisitedLessonId,
    markLessonVisited,
    onSelectionChange,
    scrollContainerId = 'main-content-scroll'
}: UseContentSelectionParams) => {
    const getModuleById = useCallback((moduleId?: string) =>
        modules.find((module) => module.id === moduleId) ?? modules[0], [modules]);

    const getLessonById = useCallback((moduleId?: string, lessonId?: string) => {
        const module = getModuleById(moduleId);
        return module.lessons.find((lesson) => lesson.id === lessonId) ?? module.lessons[0];
    }, [getModuleById]);

    const initialModule = getModuleById(initialModuleId);
    const initialLesson = getLessonById(initialModule.id, initialLessonId);

    const [activeModuleId, setActiveModuleId] = useState(initialModule.id);
    const [activeLessonId, setActiveLessonId] = useState(initialLesson.id);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAutomaton, setSelectedAutomaton] = useState<AutomatoData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const contentIndex = useMemo(() => buildContentIndex(modules), [modules]);

    const totalLessons = useMemo(() =>
        modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [modules]);

    const activeModule = useMemo(() =>
        modules.find((module) => module.id === activeModuleId) ?? modules[0],
    [activeModuleId, modules]);

    const activeLesson = useMemo(() =>
        activeModule.lessons.find((lesson) => lesson.id === activeLessonId) ?? activeModule.lessons[0],
    [activeLessonId, activeModule]);

    const moduleIndex = useMemo(() =>
        modules.findIndex((module) => module.id === activeModuleId) + 1,
    [activeModuleId, modules]);

    const filteredModules = useMemo(() => {
        if (!deferredSearchQuery.trim()) return modules;
        const queryTokens = normalizeForSearch(deferredSearchQuery)
            .split(' ')
            .filter(Boolean);
        const matchedLessons = new Set(
            contentIndex
                .filter((entry) => queryTokens.every((token) => entry.searchableText.includes(token)))
                .map((entry) => entry.lessonId)
        );

        return modules
            .map((module) => ({
                ...module,
                lessons: module.lessons.filter((lesson) => matchedLessons.has(lesson.id))
            }))
            .filter((module) => module.lessons.length > 0) as CourseModule[];
    }, [contentIndex, deferredSearchQuery, modules]);

    const navigationState = useMemo(() => {
        const modIndex = modules.findIndex((module) => module.id === activeModuleId);
        const lessonIndex = activeModule.lessons.findIndex((lesson) => lesson.id === activeLessonId);

        let prev: ContentNavigationTarget | null = null;
        let next: ContentNavigationTarget | null = null;

        if (lessonIndex > 0) {
            prev = { modId: activeModuleId, lessonId: activeModule.lessons[lessonIndex - 1].id };
        } else if (modIndex > 0) {
            const prevMod = modules[modIndex - 1];
            prev = { modId: prevMod.id, lessonId: prevMod.lessons[prevMod.lessons.length - 1].id };
        }

        if (lessonIndex < activeModule.lessons.length - 1) {
            next = { modId: activeModuleId, lessonId: activeModule.lessons[lessonIndex + 1].id };
        } else if (modIndex < modules.length - 1) {
            const nextMod = modules[modIndex + 1];
            next = { modId: nextMod.id, lessonId: nextMod.lessons[0].id };
        }

        return { prev, next };
    }, [activeLessonId, activeModule, activeModuleId, modules]);

    const lastVisitedLesson = useMemo(() => (
        lastVisitedLessonId
            ? modules
                .flatMap((module) => module.lessons.map((lesson) => ({ moduleId: module.id, lesson })))
                .find(({ lesson }) => lesson.id === lastVisitedLessonId) ?? null
            : null
    ), [lastVisitedLessonId, modules]);

    const handleNavigate = useCallback((modId: string, lessonId: string) => {
        setActiveModuleId(modId);
        setActiveLessonId(lessonId);
        setSidebarOpen(false);
    }, []);

    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const clearSelectedAutomaton = useCallback(() => setSelectedAutomaton(null), []);

    useEffect(() => {
        const container = document.getElementById(scrollContainerId);
        if (container && container.scrollHeight > container.clientHeight + 1) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeLessonId, scrollContainerId]);

    useEffect(() => {
        const nextModule = getModuleById(initialModuleId);
        const nextLesson = getLessonById(nextModule.id, initialLessonId);
        setActiveModuleId((prev) => (prev === nextModule.id ? prev : nextModule.id));
        setActiveLessonId((prev) => (prev === nextLesson.id ? prev : nextLesson.id));
    }, [getLessonById, getModuleById, initialLessonId, initialModuleId]);

    useEffect(() => {
        markLessonVisited(activeLessonId);
        onSelectionChange?.(activeModuleId, activeLessonId);
    }, [activeLessonId, activeModuleId, markLessonVisited, onSelectionChange]);

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

    return {
        activeModule,
        activeModuleId,
        activeLesson,
        activeLessonId,
        clearSelectedAutomaton,
        closeSidebar,
        filteredModules,
        handleNavigate,
        isSidebarOpen,
        lastVisitedLesson,
        moduleIndex,
        navigationState,
        openSidebar,
        searchQuery,
        selectedAutomaton,
        setSearchQuery,
        setSelectedAutomaton,
        setSidebarOpen,
        totalLessons
    };
};
