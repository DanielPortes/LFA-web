import '@testing-library/jest-dom';

// Mock crypto.randomUUID for tests
if (typeof crypto === 'undefined') {
    (globalThis as Record<string, unknown>).crypto = {
        randomUUID: () => Math.random().toString(36).substring(2, 15),
    } as Crypto;
}
