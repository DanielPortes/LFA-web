import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('.cursor-pointer') || target.closest('[role="button"]')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mouseover', handleMouseEnter);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mouseover', handleMouseEnter);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Main Dot */}
            <div
                className="fixed pointer-events-none z-[9999] rounded-full bg-ios-blue mix-blend-difference transition-transform duration-150 ease-out will-change-transform"
                style={{
                    left: position.x,
                    top: position.y,
                    width: '8px',
                    height: '8px',
                    transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`
                }}
            />
            {/* Ring */}
            <div
                className="fixed pointer-events-none z-[9998] rounded-full border border-ios-blue/50 transition-all duration-300 ease-out will-change-transform"
                style={{
                    left: position.x,
                    top: position.y,
                    width: isHovering ? '40px' : '24px',
                    height: isHovering ? '40px' : '24px',
                    transform: 'translate(-50%, -50%)',
                    opacity: isHovering ? 0.8 : 0.4
                }}
            />
        </>
    );
};
