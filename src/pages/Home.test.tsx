// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeSection } from './Home';

describe('HomeSection', () => {
    it('mantém os três CTAs principais dentro do hero inicial', () => {
        const { container } = render(<HomeSection onNavigate={vi.fn()} />);
        const hero = container.querySelector('.home-hero') as HTMLElement;

        expect(hero).toBeInTheDocument();
        expect(within(hero).getByRole('button', { name: 'Começar pela trilha' })).toBeInTheDocument();
        expect(within(hero).getByRole('button', { name: 'Resolver exercícios' })).toBeInTheDocument();
        expect(within(hero).getByRole('button', { name: 'Abrir simulador' })).toBeInTheDocument();
    });

    it('mantém o hero estático, sem camadas ou handlers de animação 3D', () => {
        const { container } = render(<HomeSection onNavigate={vi.fn()} />);
        const hero = container.querySelector('.home-hero') as HTMLElement;

        expect(hero).toBeInTheDocument();
        expect(hero).not.toHaveClass('home-hero--tilting');
        expect(hero).not.toHaveClass('home-hero--settling');
        expect(hero.querySelector('.home-hero__scene')).not.toBeInTheDocument();
        expect(hero.querySelector('.home-hero__backdrop')).not.toBeInTheDocument();
        expect(hero.querySelector('.home-hero__base')).toBeInTheDocument();
        expect(hero.querySelector('.home-lab-card')).toBeInTheDocument();

        fireEvent.pointerMove(hero, { clientX: 750, clientY: 125 });
        fireEvent.pointerLeave(hero);

        expect(hero.className).not.toContain('home-hero--');
        expect(hero).not.toHaveClass('home-hero--tilting');
        expect(hero).not.toHaveClass('home-hero--settling');
        expect(hero.getAttribute('style') ?? '').not.toContain('--hero-');
    });

    it('exibe assinatura discreta no final da página com link do GitHub por ícone', () => {
        render(<HomeSection onNavigate={vi.fn()} />);

        expect(screen.getByText('Daniel Fagundes')).toBeInTheDocument();

        const githubLink = screen.getByRole('link', { name: 'GitHub de Daniel Fagundes' });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/DanielPortes/');
        expect(githubLink).toHaveClass('home-signature__github');
        expect(screen.queryByText('https://github.com/DanielPortes/')).not.toBeInTheDocument();
    });

    it('usa tratamento de vidro próprio nos cards da home sem afetar a assinatura', () => {
        render(<HomeSection onNavigate={vi.fn()} />);

        const entryGrid = screen.getByTestId('home-entry-cards');
        expect(within(entryGrid).getByText('Começar pela trilha').closest('.home-glass-card')).toBeInTheDocument();
        expect(screen.getByText('Como estudar aqui').closest('.home-glass-card')).toBeInTheDocument();
        expect(screen.getByText('Trilha sugerida de estudo').closest('.home-glass-card')).toBeInTheDocument();
        expect(screen.getByText('Daniel Fagundes').closest('.home-glass-card')).not.toBeInTheDocument();
    });

    it('isola o hover dos cards navegáveis para não recortar sombra no topo', () => {
        render(<HomeSection onNavigate={vi.fn()} />);

        const entryGrid = screen.getByTestId('home-entry-cards');
        const card = within(entryGrid).getByText('Começar pela trilha').closest('.home-glass-card');
        expect(card?.parentElement).toHaveClass('home-card-grid', 'home-section-grid');
        expect(card).toHaveClass('home-card-interactive');
        expect(card).toHaveClass('home-card-subtle');
    });

    it('navega apenas pelo comando Abrir dos cards de entrada', () => {
        const onNavigate = vi.fn();
        render(<HomeSection onNavigate={onNavigate} />);
        const entryGrid = screen.getByTestId('home-entry-cards');

        fireEvent.click(within(entryGrid).getByText('Começar pela trilha'));
        expect(onNavigate).not.toHaveBeenCalled();

        fireEvent.click(within(entryGrid).getByRole('button', { name: 'Abrir Começar pela trilha' }));
        expect(onNavigate).toHaveBeenCalledWith('conteudo');
    });

    it('mantém os grupos de cards da home visualmente separados', () => {
        render(<HomeSection onNavigate={vi.fn()} />);

        const studyGrid = screen.getByText('Como estudar aqui').closest('.home-section-grid');
        const journeyGrid = screen.getByText('Trilha sugerida de estudo').closest('.home-section-grid');

        expect(studyGrid).toBeInTheDocument();
        expect(journeyGrid).toBe(studyGrid);
    });

    it('centraliza verticalmente o diagrama da trilha sugerida dentro do card', () => {
        render(<HomeSection onNavigate={vi.fn()} />);

        expect(screen.getByText('Trilha sugerida de estudo').closest('.home-journey-card')).toBeInTheDocument();
        expect(screen.getByText('Fundamentos').closest('.home-journey-diagram')).toBeInTheDocument();
        expect(screen.getByText('Fundamentos').closest('.home-journey-track')).toBeInTheDocument();
        expect(screen.getByTestId('home-journey-line')).toHaveClass('home-journey-line');
    });
});
