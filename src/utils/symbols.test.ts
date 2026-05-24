import { describe, expect, it } from 'vitest';
import { tokenizeInput } from './symbols';

describe('tokenizeInput', () => {
    it('aceita aliases digitáveis para representar a entrada vazia', () => {
        for (const value of ['eps', 'epsilon', 'vazio', 'empty', 'lambda', 'ε']) {
            expect(tokenizeInput(value)).toEqual([]);
        }
    });

    it('mantém palavras comuns como sequência de símbolos quando não são alias de vazio', () => {
        expect(tokenizeInput('abba')).toEqual(['a', 'b', 'b', 'a']);
    });
});
