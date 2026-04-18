// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

const StableListenerProbe = ({ label }: { label: string }) => {
    useWindowKeyboard({
        onKeyDown: (event) => {
            if (event.key === 'k') {
                document.body.dataset.keyboardLabel = label;
            }
        }
    });

    return null;
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

    it('mantém listeners estáveis entre rerenders e usa callbacks atualizados', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');

        const { rerender, unmount } = render(<StableListenerProbe label="primeiro" />);
        const keydownAddsAfterMount = addSpy.mock.calls.filter(([type]) => type === 'keydown').length;

        rerender(<StableListenerProbe label="segundo" />);

        expect(addSpy.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(keydownAddsAfterMount);

        fireEvent.keyDown(window, { key: 'k' });
        expect(document.body.dataset.keyboardLabel).toBe('segundo');

        unmount();

        expect(removeSpy.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);

        delete document.body.dataset.keyboardLabel;
        addSpy.mockRestore();
        removeSpy.mockRestore();
    });
});
