import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { isEditableTarget } from './shortcutUtils';
import { useModifierKey, useWindowKeyboard } from './useWindowKeyboard';

const KeyboardProbe = () => {
    const ctrlPressed = useModifierKey('Control');
    useWindowKeyboard({
        onKeyDown: (event) => {
            if (event.key === 'k') {
                const node = document.getElementById('result');
                if (node) {
                    node.textContent = isEditableTarget(event.target) ? 'editable' : 'plain';
                }
            }
        }
    });

    return (
        <div>
            <input aria-label="entrada" />
            <div id="result">{ctrlPressed ? 'pressed' : 'idle'}</div>
        </div>
    );
};

describe('useWindowKeyboard', () => {
    it('acompanha teclas modificadoras e diferencia alvos editáveis', () => {
        render(<KeyboardProbe />);

        fireEvent.keyDown(window, { key: 'Control' });
        expect(screen.getByText('pressed')).toBeInTheDocument();

        fireEvent.keyUp(window, { key: 'Control' });
        expect(screen.getByText('idle')).toBeInTheDocument();

        fireEvent.keyDown(screen.getByLabelText('entrada'), { key: 'k' });
        expect(screen.getByText('editable')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'k' });
        expect(screen.getByText('plain')).toBeInTheDocument();
    });
});
