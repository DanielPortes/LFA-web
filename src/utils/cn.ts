import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for merging Tailwind CSS classes conditionally.
 * Combines clsx for conditional classes.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", { "text-white": isActive })
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}
