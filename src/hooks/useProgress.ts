import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState';

interface ExerciseProgress {
    completed: Record<string, boolean>;
    lastCategory?: string;
}

interface ProgressData {
    completedLessons: string[];
    currentLesson: string | null;
    lastVisited: string | null;
    reviewLessons: string[];
    visitedLessons: string[];
    exercises: ExerciseProgress;
}

const STORAGE_KEY = 'lfa-learning-progress';
const LEGACY_LESSON_KEY = 'lfa-progress';
const LEGACY_EXERCISE_KEY = 'lfa-exercises-progress';

const createDefaultProgress = (): ProgressData => ({
    completedLessons: [],
    currentLesson: null,
    lastVisited: null,
    reviewLessons: [],
    visitedLessons: [],
    exercises: {
        completed: {},
        lastCategory: undefined
    }
});

const normalizeExercises = (value?: Partial<ExerciseProgress> | null): ExerciseProgress => {
    const completed = value?.completed && typeof value.completed === 'object'
        ? Object.fromEntries(
            Object.entries(value.completed).map(([key, val]) => [key, Boolean(val)])
        )
        : {};
    const lastCategory = typeof value?.lastCategory === 'string' ? value.lastCategory : undefined;
    return { completed, lastCategory };
};

const normalizeProgress = (value?: Partial<ProgressData> | null): ProgressData => {
    if (!value || typeof value !== 'object') return createDefaultProgress();
    return {
        completedLessons: Array.isArray(value.completedLessons) ? value.completedLessons.filter(Boolean) : [],
        currentLesson: typeof value.currentLesson === 'string' ? value.currentLesson : null,
        lastVisited: typeof value.lastVisited === 'string' ? value.lastVisited : null,
        reviewLessons: Array.isArray(value.reviewLessons) ? value.reviewLessons.filter(Boolean) : [],
        visitedLessons: Array.isArray(value.visitedLessons) ? value.visitedLessons.filter(Boolean) : [],
        exercises: normalizeExercises(value.exercises)
    };
};

const readStoredProgress = (): ProgressData => {
    if (typeof window === 'undefined') return createDefaultProgress();
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return normalizeProgress(JSON.parse(saved));
        }
        const legacyLessons = localStorage.getItem(LEGACY_LESSON_KEY);
        const legacyExercises = localStorage.getItem(LEGACY_EXERCISE_KEY);
        if (legacyLessons || legacyExercises) {
            const parsedLessons = legacyLessons ? JSON.parse(legacyLessons) : null;
            const parsedExercises = legacyExercises ? JSON.parse(legacyExercises) : null;
            const next = normalizeProgress({
                ...(parsedLessons && typeof parsedLessons === 'object' ? parsedLessons : {}),
                exercises: parsedExercises && typeof parsedExercises === 'object' ? parsedExercises : undefined
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            localStorage.removeItem(LEGACY_LESSON_KEY);
            localStorage.removeItem(LEGACY_EXERCISE_KEY);
            return next;
        }
    } catch (e) {
        console.warn('Failed to load progress:', e);
    }
    return createDefaultProgress();
};

export function useProgress() {
    const [progress, setProgress] = useLocalStorageState<ProgressData>(
        STORAGE_KEY,
        readStoredProgress,
        { readOnInit: false }
    );

    const markLessonVisited = useCallback((lessonId: string) => {
        setProgress(prev => {
            if (prev.visitedLessons.includes(lessonId) && prev.currentLesson === lessonId) {
                return prev;
            }
            if (prev.visitedLessons.includes(lessonId)) {
                return { ...prev, currentLesson: lessonId, lastVisited: lessonId };
            }
            return {
                ...prev,
                visitedLessons: [...prev.visitedLessons, lessonId],
                currentLesson: lessonId,
                lastVisited: lessonId
            };
        });
    }, [setProgress]);

    const markLessonCompleted = useCallback((lessonId: string) => {
        setProgress(prev => {
            if (prev.completedLessons.includes(lessonId)) return prev;
            return {
                ...prev,
                completedLessons: [...prev.completedLessons, lessonId],
                reviewLessons: prev.reviewLessons.filter(id => id !== lessonId)
            };
        });
    }, [setProgress]);

    const toggleLessonReview = useCallback((lessonId: string) => {
        setProgress(prev => {
            const isMarked = prev.reviewLessons.includes(lessonId);
            return {
                ...prev,
                reviewLessons: isMarked
                    ? prev.reviewLessons.filter(id => id !== lessonId)
                    : [...prev.reviewLessons, lessonId]
            };
        });
    }, [setProgress]);

    const isLessonCompleted = useCallback((lessonId: string) => {
        return progress.completedLessons.includes(lessonId);
    }, [progress.completedLessons]);

    const isLessonVisited = useCallback((lessonId: string) => {
        return progress.visitedLessons.includes(lessonId);
    }, [progress.visitedLessons]);

    const isLessonMarkedForReview = useCallback((lessonId: string) => {
        return progress.reviewLessons.includes(lessonId);
    }, [progress.reviewLessons]);

    const getProgressPercentage = useCallback((totalLessons: number) => {
        if (totalLessons === 0) return 0;
        return Math.round((progress.completedLessons.length / totalLessons) * 100);
    }, [progress.completedLessons.length]);

    const resetProgress = useCallback(() => {
        setProgress(prev => ({
            ...createDefaultProgress(),
            exercises: prev.exercises
        }));
    }, [setProgress]);

    const markExerciseCompleted = useCallback((categoryId: string, exerciseId: number) => {
        setProgress(prev => {
            const key = `${categoryId}-${exerciseId}`;
            if (prev.exercises.completed[key]) return prev;
            return {
                ...prev,
                exercises: {
                    ...prev.exercises,
                    completed: {
                        ...prev.exercises.completed,
                        [key]: true
                    }
                }
            };
        });
    }, [setProgress]);

    const isExerciseCompleted = useCallback((categoryId: string, exerciseId: number | null | undefined) => {
        if (exerciseId == null) return false;
        return !!progress.exercises.completed[`${categoryId}-${exerciseId}`];
    }, [progress.exercises.completed]);

    const setLastCategory = useCallback((categoryId: string) => {
        setProgress(prev => {
            if (prev.exercises.lastCategory === categoryId) return prev;
            return {
                ...prev,
                exercises: {
                    ...prev.exercises,
                    lastCategory: categoryId
                }
            };
        });
    }, [setProgress]);

    const resetExercises = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            exercises: {
                completed: {},
                lastCategory: undefined
            }
        }));
    }, [setProgress]);

    return {
        progress,
        markLessonVisited,
        markLessonCompleted,
        toggleLessonReview,
        isLessonCompleted,
        isLessonMarkedForReview,
        isLessonVisited,
        getProgressPercentage,
        resetProgress,
        markExerciseCompleted,
        isExerciseCompleted,
        setLastCategory,
        resetExercises
    };
}
