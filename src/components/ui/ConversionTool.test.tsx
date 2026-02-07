import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionTool } from './ConversionTool';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('ConversionTool', () => {
    it('renders when open', () => {
        const onClose = vi.fn();
        render(<ConversionTool isOpen={true} onClose={onClose} />);
        expect(screen.getByText('Conversor de Modelos')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        const onClose = vi.fn();
        render(<ConversionTool isOpen={false} onClose={onClose} />);
        expect(screen.queryByText('Conversor de Modelos')).not.toBeInTheDocument();
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
});
