import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useUiSettings } from '../../hooks/UiSettingsContext';

export const CustomCursor: React.FC = () => {
    const { cursorEnabled, effectiveReduceMotion } = useUiSettings();
    // Use refs for DOM elements to update position without React renders
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);

    // Use ref to track visibility without causing re-renders in event handlers
    const isVisibleRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(pointer: coarse)');
        setIsCoarsePointer(media.matches);
        const handler = (event: MediaQueryListEvent) => setIsCoarsePointer(event.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    // Sync ref with state
    useEffect(() => {
        isVisibleRef.current = isVisible;
    }, [isVisible]);

    const handleMouseLeave = useCallback((e: MouseEvent) => {
        // Only hide if actually leaving the window
        const relatedTarget = e.relatedTarget as Node | null;
        if (!relatedTarget || !document.body.contains(relatedTarget)) {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        const enabled = cursorEnabled && !effectiveReduceMotion && !isCoarsePointer;
        if (!enabled) {
            document.body.classList.remove('custom-cursor-active');
            return;
        }

        const updatePosition = (e: MouseEvent) => {
            if (dotRef.current) {
                dotRef.current.style.left = `${e.clientX}px`;
                dotRef.current.style.top = `${e.clientY}px`;
            }
            if (ringRef.current) {
                ringRef.current.style.left = `${e.clientX}px`;
                ringRef.current.style.top = `${e.clientY}px`;
            }
            // Use ref to check visibility to avoid stale closure
            if (!isVisibleRef.current) {
                setIsVisible(true);
            }
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.cursor-pointer') || target.closest('[role="button"]')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mouseover', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Hide default cursor globally
        document.body.classList.add('custom-cursor-active');

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mouseover', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.body.classList.remove('custom-cursor-active');
        };
    }, [cursorEnabled, effectiveReduceMotion, isCoarsePointer, handleMouseLeave]);

    if (!cursorEnabled || effectiveReduceMotion || isCoarsePointer) return null;

    return (
        <div style={{ opacity: isVisible ? 1 : 0 }} className="transition-opacity duration-300">
            {/* Main Dot */}
            <div
                ref={dotRef}
                className="fixed pointer-events-none z-[9999] rounded-full bg-ios-blue mix-blend-difference transition-transform duration-150 ease-out will-change-transform"
                style={{
                    left: 0, top: 0,
                    width: '8px', height: '8px',
                    transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                className="fixed pointer-events-none z-[9998] rounded-full border border-ios-blue/50 transition-all duration-300 ease-out will-change-transform"
                style={{
                    left: 0, top: 0,
                    width: isHovering ? '40px' : '24px',
                    height: isHovering ? '40px' : '24px',
                    transform: 'translate(-50%, -50%)',
                    opacity: isHovering ? 0.8 : 0.4
                }}
            />
        </div>
    );
};
