import { useState, useEffect, useCallback } from 'react';

interface ProgressData {
    completedLessons: string[];
    currentLesson: string | null;
    lastVisited: string | null;
    visitedLessons: string[];
}

const STORAGE_KEY = 'lfa-progress';

const defaultProgress: ProgressData = {
    completedLessons: [],
    currentLesson: null,
    lastVisited: null,
    visitedLessons: []
};

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData>(defaultProgress);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setProgress(JSON.parse(saved));
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
        setProgress(defaultProgress);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        progress,
        markLessonVisited,
        markLessonCompleted,
        isLessonCompleted,
        isLessonVisited,
        getProgressPercentage,
        resetProgress
    };
}
