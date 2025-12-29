import { useState, useEffect, useCallback } from 'react';

interface ExerciseProgress {
    completed: Record<string, boolean>;
    lastCategory?: string;
}

interface ProgressData {
    completedLessons: string[];
    currentLesson: string | null;
    lastVisited: string | null;
    visitedLessons: string[];
    exercises: ExerciseProgress;
}

const STORAGE_KEY = 'lfa-learning-progress';
const LEGACY_LESSON_KEY = 'lfa-progress';
const LEGACY_EXERCISE_KEY = 'lfa-exercises-progress';

const defaultProgress: ProgressData = {
    completedLessons: [],
    currentLesson: null,
    lastVisited: null,
    visitedLessons: [],
    exercises: {
        completed: {},
        lastCategory: undefined
    }
};

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData>(defaultProgress);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setProgress(JSON.parse(saved));
                return;
            }
            const legacyLessons = localStorage.getItem(LEGACY_LESSON_KEY);
            const legacyExercises = localStorage.getItem(LEGACY_EXERCISE_KEY);
            if (legacyLessons || legacyExercises) {
                const next = { ...defaultProgress };
                if (legacyLessons) {
                    const parsed = JSON.parse(legacyLessons) as Omit<ProgressData, 'exercises'>;
                    next.completedLessons = parsed.completedLessons || [];
                    next.currentLesson = parsed.currentLesson ?? null;
                    next.lastVisited = parsed.lastVisited ?? null;
                    next.visitedLessons = parsed.visitedLessons || [];
                }
                if (legacyExercises) {
                    const parsed = JSON.parse(legacyExercises) as ExerciseProgress;
                    next.exercises.completed = parsed.completed || {};
                    next.exercises.lastCategory = parsed.lastCategory;
                }
                setProgress(next);
                localStorage.removeItem(LEGACY_LESSON_KEY);
                localStorage.removeItem(LEGACY_EXERCISE_KEY);
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }, [progress]);

    const markLessonVisited = useCallback((lessonId: string) => {
        setProgress(prev => {
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
    }, []);

    const markLessonCompleted = useCallback((lessonId: string) => {
        setProgress(prev => {
            if (prev.completedLessons.includes(lessonId)) return prev;
            return {
                ...prev,
                completedLessons: [...prev.completedLessons, lessonId]
            };
        });
    }, []);

    const isLessonCompleted = useCallback((lessonId: string) => {
        return progress.completedLessons.includes(lessonId);
    }, [progress.completedLessons]);

    const isLessonVisited = useCallback((lessonId: string) => {
        return progress.visitedLessons.includes(lessonId);
    }, [progress.visitedLessons]);

    const getProgressPercentage = useCallback((totalLessons: number) => {
        if (totalLessons === 0) return 0;
        return Math.round((progress.completedLessons.length / totalLessons) * 100);
    }, [progress.completedLessons.length]);

    const resetProgress = useCallback(() => {
        setProgress(prev => ({
            ...defaultProgress,
            exercises: prev.exercises
        }));
    }, []);

    const markExerciseCompleted = useCallback((categoryId: string, exerciseId: number) => {
        setProgress(prev => ({
            ...prev,
            exercises: {
                ...prev.exercises,
                completed: {
                    ...prev.exercises.completed,
                    [`${categoryId}-${exerciseId}`]: true
                }
            }
        }));
    }, []);

    const isExerciseCompleted = useCallback((categoryId: string, exerciseId: number | null | undefined) => {
        if (exerciseId == null) return false;
        return !!progress.exercises.completed[`${categoryId}-${exerciseId}`];
    }, [progress.exercises.completed]);

    const setLastCategory = useCallback((categoryId: string) => {
        setProgress(prev => ({
            ...prev,
            exercises: {
                ...prev.exercises,
                lastCategory: categoryId
            }
        }));
    }, []);

    const resetExercises = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            exercises: {
                completed: {},
                lastCategory: undefined
            }
        }));
    }, []);

    return {
        progress,
        markLessonVisited,
        markLessonCompleted,
        isLessonCompleted,
        isLessonVisited,
        getProgressPercentage,
        resetProgress,
        markExerciseCompleted,
        isExerciseCompleted,
        setLastCategory,
        resetExercises
    };
}
