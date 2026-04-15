import React from 'react';
import { ArrowLeft, ArrowRight, Circle, CircleCheck } from 'lucide-react';

interface LessonNavigatorProps {
    isCompleted: boolean;
    onMarkCompleted: () => void;
    previousLesson: { modId: string; lessonId: string } | null;
    nextLesson: { modId: string; lessonId: string } | null;
    onNavigate: (modId: string, lessonId: string) => void;
}

export const LessonNavigator: React.FC<LessonNavigatorProps> = ({
    isCompleted,
    onMarkCompleted,
    previousLesson,
    nextLesson,
    onNavigate
}) => (
    <div className="mt-24 border-t border-default pt-8">
        <div className="mb-8 flex justify-center">
            <button
                onClick={onMarkCompleted}
                disabled={isCompleted}
                className={`flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold transition-all
                    ${isCompleted
                        ? 'cursor-default bg-ios-green/10 text-ios-green'
                        : 'bg-ios-green text-white shadow-lg shadow-green-500/30 hover:scale-105 hover:bg-green-600 active:scale-95'
                    }`}
            >
                {isCompleted ? (
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

        <div className="flex items-center justify-between">
            <button
                onClick={() => previousLesson && onNavigate(previousLesson.modId, previousLesson.lessonId)}
                disabled={!previousLesson}
                className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all
                    ${previousLesson
                        ? 'cursor-pointer text-primary hover:bg-black/5 dark:hover:bg-white/10'
                        : 'cursor-not-allowed text-secondary opacity-50'
                    }`}
            >
                <ArrowLeft size={20} />
                <span className="hidden font-bold sm:inline">Anterior</span>
            </button>

            <button
                onClick={() => nextLesson && onNavigate(nextLesson.modId, nextLesson.lessonId)}
                disabled={!nextLesson}
                className={`flex items-center gap-3 rounded-full px-8 py-4 shadow-lg transition-all
                    ${nextLesson
                        ? 'cursor-pointer bg-ios-blue text-white hover:scale-105 hover:bg-blue-600 active:scale-95'
                        : 'cursor-not-allowed bg-black/5 text-secondary opacity-50 dark:bg-white/10'
                    }`}
            >
                <span className="font-bold">Próxima Lição</span>
                <ArrowRight size={20} />
            </button>
        </div>
    </div>
);
