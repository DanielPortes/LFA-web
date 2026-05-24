import { useState } from 'react';

const STORAGE_KEY = 'lfa-tutorial-completed';

export const useTutorial = () => {
    const [showTutorial, setShowTutorial] = useState(false);

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
