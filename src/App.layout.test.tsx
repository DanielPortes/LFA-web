import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';
import { mockViewport } from './test/browserMocks';

describe('App layout', () => {
    afterEach(() => {
        window.localStorage.clear();
        document.documentElement.className = '';
    });

    it('mantém o conteúdo principal alinhado à altura real da TopNav sem espaço morto extra', () => {
        mockViewport({ width: 1280, height: 800, reduceMotion: true });

        const { container } = render(<App />);
        const main = container.querySelector('#main-content');

        expect(main).not.toBeNull();
        expect(main?.className).toContain('mt-20');
        expect(main?.className).toContain('sm:mt-[5.5rem]');
        expect(main?.className).toContain('lg:mt-24');
        expect(main?.className).not.toContain('mt-28');
        expect(main?.className).not.toContain('mt-32');
    });
});
