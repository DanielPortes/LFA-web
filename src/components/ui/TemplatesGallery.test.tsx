import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TemplatesGallery } from './TemplatesGallery';

describe('TemplatesGallery', () => {
    it('permite filtrar templates por tipo de autômato para criação rápida', () => {
        render(<TemplatesGallery isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Tipo AP' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tipo MT' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Tipo AP' }));

        expect(screen.getByText(/templates do tipo AP/i)).toBeInTheDocument();
        expect(screen.getAllByText('AP').length).toBeGreaterThan(0);
    });
});
