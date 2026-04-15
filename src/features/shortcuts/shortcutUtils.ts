export const isEditableTarget = (target: EventTarget | null): boolean => (
    target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable)
);

export const isTargetWithin = (target: EventTarget | null, selector: string): boolean => (
    target instanceof HTMLElement && !!target.closest(selector)
);
