import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lfa-tutorial-completed';

export const useTutorial = () => {
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            const timer = setTimeout(() => setShowTutorial(true), 1000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, []);

    const completeTutorial = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setShowTutorial(false);
    };

    const resetTutorial = () => {
        localStorage.removeItem(STORAGE_KEY);
        setShowTutorial(true);
    };

    return { showTutorial, setShowTutorial, completeTutorial, resetTutorial };
};
