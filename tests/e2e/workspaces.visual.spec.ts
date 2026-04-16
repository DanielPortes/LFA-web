import { expect, test } from '@playwright/test';
import { encodeAutomaton, stabilizePage } from './visualHelpers';

const smallAutomaton = encodeAutomaton({
    tipo: 'AFD',
    descricao: 'Autômato de teste',
    estados: [
        { id: 'q0', label: 'q0', x: 180, y: 180, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 420, y: 180, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'q1', simbolo: 'a' },
        { id: 't1', de: 'q1', para: 'q1', simbolo: 'a,b' },
    ],
});

test('simulador vazio', async ({ page }) => {
    await page.goto('/?tab=simulador');
    await page.getByTestId('simulator-workspace').waitFor();
    await stabilizePage(page);

    await expect(page.getByTestId('simulator-workspace')).toHaveScreenshot('simulator-empty.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('simulador com autômato pequeno', async ({ page }) => {
    await page.goto(`/?automaton=${smallAutomaton}`);
    await page.getByTestId('simulator-workspace').waitFor();
    await stabilizePage(page);

    await expect(page.getByTestId('simulator-workspace')).toHaveScreenshot('simulator-small-automaton.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('simulador com inspetor aberto', async ({ page }) => {
    await page.goto(`/?automaton=${smallAutomaton}`);
    await page.getByTestId('simulator-workspace').waitFor();
    await page.getByRole('button', { name: 'Abrir inspetor da simulação' }).click();
    await page.getByText('Simulação e diagnóstico').waitFor();
    await stabilizePage(page);

    await expect(page.getByTestId('simulator-workspace')).toHaveScreenshot('simulator-inspector-open.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('solver modal', async ({ page }) => {
    await page.goto('/?tab=exercicios&cat=afd&ex=1');
    const dialog = page.getByRole('dialog', { name: 'Exercício 1' });
    await dialog.waitFor();
    await stabilizePage(page);

    await expect(dialog).toHaveScreenshot('solver-modal.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('preview inline simples', async ({ page }) => {
    await page.goto('/?tab=conteudo&module=mod2&lesson=l2-concept');
    const previewBlock = page.getByTestId('content-example-block').first();
    await previewBlock.waitFor();
    await stabilizePage(page);

    await expect(previewBlock).toHaveScreenshot('content-preview-inline-simple.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('preview before e depois', async ({ page }) => {
    await page.goto('/?tab=conteudo&module=mod8&lesson=l8-grafos');
    const previewBlock = page.getByTestId('content-example-block').first();
    await previewBlock.waitFor();
    await stabilizePage(page);

    await expect(previewBlock).toHaveScreenshot('content-preview-before-after.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('gramática vazia', async ({ page }) => {
    await page.goto('/?tab=gramatica');
    await page.getByTestId('grammar-workspace').waitFor();
    await stabilizePage(page);

    await expect(page.getByTestId('grammar-workspace')).toHaveScreenshot('grammar-empty.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});

test('gramática com árvore e passos', async ({ page }) => {
    await page.goto('/?tab=gramatica');
    await page.getByLabel('Palavra a ser derivada').fill('ab');
    await page.getByRole('button', { name: 'Derivar' }).click();
    await page.getByText('Palavra aceita').waitFor();
    await stabilizePage(page);

    await expect(page.getByTestId('grammar-workspace')).toHaveScreenshot('grammar-result.png', {
        animations: 'disabled',
        caret: 'hide',
    });
});
