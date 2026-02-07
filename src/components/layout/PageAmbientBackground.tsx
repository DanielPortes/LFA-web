import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useUiSettings } from '../../hooks/useUiSettings';
import type { Tab } from '../../types';

type AmbientPreset = {
    intensity: number;
    mesh: string;
    orbA: string;
    orbB: string;
    orbC: string;
};

const AMBIENT_PRESETS: Record<Tab, AmbientPreset> = {
    home: {
        intensity: 0.54,
        mesh: 'radial-gradient(circle at 15% 20%, rgba(0,122,255,0.22), transparent 48%), radial-gradient(circle at 82% 18%, rgba(80,120,255,0.16), transparent 42%), radial-gradient(circle at 52% 78%, rgba(0,198,255,0.14), transparent 44%)',
        orbA: 'radial-gradient(circle, rgba(0,122,255,0.34), rgba(0,122,255,0))',
        orbB: 'radial-gradient(circle, rgba(95,90,255,0.28), rgba(95,90,255,0))',
        orbC: 'radial-gradient(circle, rgba(63,185,160,0.22), rgba(63,185,160,0))'
    },
    conteudo: {
        intensity: 0.34,
        mesh: 'radial-gradient(circle at 18% 24%, rgba(16,185,129,0.18), transparent 42%), radial-gradient(circle at 76% 16%, rgba(56,189,248,0.16), transparent 42%), radial-gradient(circle at 58% 78%, rgba(45,212,191,0.12), transparent 44%)',
        orbA: 'radial-gradient(circle, rgba(16,185,129,0.24), rgba(16,185,129,0))',
        orbB: 'radial-gradient(circle, rgba(14,165,233,0.22), rgba(14,165,233,0))',
        orbC: 'radial-gradient(circle, rgba(45,212,191,0.18), rgba(45,212,191,0))'
    },
    exercicios: {
        intensity: 0.24,
        mesh: 'radial-gradient(circle at 14% 25%, rgba(249,115,22,0.14), transparent 44%), radial-gradient(circle at 82% 16%, rgba(59,130,246,0.1), transparent 40%), radial-gradient(circle at 62% 78%, rgba(234,179,8,0.12), transparent 45%)',
        orbA: 'radial-gradient(circle, rgba(249,115,22,0.2), rgba(249,115,22,0))',
        orbB: 'radial-gradient(circle, rgba(59,130,246,0.16), rgba(59,130,246,0))',
        orbC: 'radial-gradient(circle, rgba(250,204,21,0.14), rgba(250,204,21,0))'
    },
    simulador: {
        intensity: 0.05,
        mesh: 'radial-gradient(circle at 20% 20%, rgba(148,163,184,0.08), transparent 48%), radial-gradient(circle at 80% 24%, rgba(148,163,184,0.06), transparent 42%), radial-gradient(circle at 56% 82%, rgba(148,163,184,0.05), transparent 44%)',
        orbA: 'radial-gradient(circle, rgba(148,163,184,0.1), rgba(148,163,184,0))',
        orbB: 'radial-gradient(circle, rgba(148,163,184,0.08), rgba(148,163,184,0))',
        orbC: 'radial-gradient(circle, rgba(148,163,184,0.06), rgba(148,163,184,0))'
    }
};

interface PageAmbientBackgroundProps {
    tab: Tab;
    transitionKey: number;
}

export const PageAmbientBackground = ({ tab, transitionKey }: PageAmbientBackgroundProps) => {
    const { effectiveReduceMotion, focusMode } = useUiSettings();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const preset = AMBIENT_PRESETS[tab];
    const staticMode = effectiveReduceMotion || focusMode || tab === 'simulador';

    useEffect(() => {
        if (transitionKey === 0 || staticMode) {
            setIsTransitioning(false);
            return;
        }

        setIsTransitioning(true);
        const timeout = window.setTimeout(() => setIsTransitioning(false), 820);
        return () => window.clearTimeout(timeout);
    }, [transitionKey, staticMode]);

    const style = useMemo(() => {
        const intensity = focusMode ? preset.intensity * 0.4 : preset.intensity;
        return {
            '--ambient-intensity': String(intensity),
            '--ambient-mesh': preset.mesh,
            '--ambient-orb-a': preset.orbA,
            '--ambient-orb-b': preset.orbB,
            '--ambient-orb-c': preset.orbC
        } as CSSProperties;
    }, [focusMode, preset]);

    return (
        <div
            aria-hidden="true"
            className={`page-ambient page-ambient--${tab} ${staticMode ? 'is-static' : ''} ${isTransitioning ? 'is-transitioning' : ''}`}
            style={style}
        >
            <div className="page-ambient__mesh" />
            <div className="page-ambient__orb page-ambient__orb--a" />
            <div className="page-ambient__orb page-ambient__orb--b" />
            <div className="page-ambient__orb page-ambient__orb--c" />
            <div className="page-ambient__flash" />
        </div>
    );
};
