import { useEffect, useState } from 'react';
import type { ExerciseDatabase } from './types';

interface ExerciseDataState {
    exerciseDatabase: ExerciseDatabase;
    isLoading: boolean;
    error: string | null;
}

export const useExerciseData = () => {
    const [state, setState] = useState<ExerciseDataState>({
        exerciseDatabase: {},
        isLoading: true,
        error: null
    });

    useEffect(() => {
        let isActive = true;

        const loadExercises = async () => {
            try {
                const module = await import('../../data/constants');
                if (!isActive) return;
                setState({
                    exerciseDatabase: module.exerciciosDB,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                if (!isActive) return;
                console.error('Falha ao carregar banco de exercícios:', error);
                setState({
                    exerciseDatabase: {},
                    isLoading: false,
                    error: 'Não foi possível carregar os exercícios agora.'
                });
            }
        };

        void loadExercises();

        return () => {
            isActive = false;
        };
    }, []);

    return state;
};
