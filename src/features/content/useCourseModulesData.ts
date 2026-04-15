import { useEffect, useState } from 'react';
import type { CourseModule } from '../../types';

interface CourseModulesState {
    modules: CourseModule[];
    isLoading: boolean;
    error: string | null;
}

export const useCourseModulesData = () => {
    const [state, setState] = useState<CourseModulesState>({
        modules: [],
        isLoading: true,
        error: null
    });

    useEffect(() => {
        let isActive = true;

        const loadModules = async () => {
            try {
                const module = await import('../../data/theoryData');
                if (!isActive) return;
                setState({
                    modules: module.courseModules,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                if (!isActive) return;
                console.error('Falha ao carregar módulos teóricos:', error);
                setState({
                    modules: [],
                    isLoading: false,
                    error: 'Não foi possível carregar o conteúdo teórico agora.'
                });
            }
        };

        void loadModules();

        return () => {
            isActive = false;
        };
    }, []);

    return state;
};
