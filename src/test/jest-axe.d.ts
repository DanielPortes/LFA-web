declare module 'jest-axe' {
    export interface AxeViolation {
        id: string;
        impact?: string;
        description: string;
        help: string;
        helpUrl: string;
        nodes: Array<{
            html: string;
            target: string[];
        }>;
    }

    export interface AxeResults {
        violations: AxeViolation[];
    }

    export const axe: (
        container: Element | Document | string,
        options?: Record<string, unknown>
    ) => Promise<AxeResults>;

    export const toHaveNoViolations: {
        (results: AxeResults): {
            pass: boolean;
            message: () => string;
        };
    };
}
