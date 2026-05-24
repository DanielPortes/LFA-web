import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionTool } from './ConversionTool';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('ConversionTool', () => {
    it('renders when open', () => {
        const onClose = vi.fn();
        render(<ConversionTool isOpen={true} onClose={onClose} />);
        expect(screen.getByText('Conversor')).toBeInTheDocument();
        expect(screen.getByText('Transforme a representação sem sair do exercício.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gerar resultado/i })).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        const onClose = vi.fn();
        render(<ConversionTool isOpen={false} onClose={onClose} />);
        expect(screen.queryByText('Conversor')).not.toBeInTheDocument();
    });

    it('switches tabs', () => {
        const onClose = vi.fn();
        render(<ConversionTool isOpen={true} onClose={onClose} />);
        
        const regexTab = screen.getByText('Regex');
        fireEvent.click(regexTab);
        
        // Check for Regex placeholder or specific text
        expect(screen.getByPlaceholderText('(a+b)*abb')).toBeInTheDocument();

        const grammarTab = screen.getByText('Gramática');
        fireEvent.click(grammarTab);
        
        // Check for Grammar placeholder
        expect(screen.getByPlaceholderText('S -> a S b | eps')).toBeInTheDocument();
    });

    it('renderiza em portal para manter o overlay centralizado na viewport', () => {
        const onClose = vi.fn();

        render(
            <div data-testid="transform-parent" style={{ transform: 'translateY(10px)' }}>
                <ConversionTool isOpen={true} onClose={onClose} />
            </div>
        );

        const title = screen.getByText('Conversor');
        const transformedParent = screen.getByTestId('transform-parent');

        expect(transformedParent.contains(title)).toBe(false);
        expect(title.closest('.overlay-backdrop')?.parentElement).toBe(document.body);
    });
});
