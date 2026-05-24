import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTheme } from '../../hooks/ThemeContext';
import { useUiSettings } from '../../hooks/useUiSettings';
import type { Tab } from '../../types';

type AmbientTheme = 'light' | 'dark';

type AmbientVariant = {
    intensity: number;
    base: string;
    mesh: string;
    veil: string;
    orbA: string;
    orbB: string;
    orbC: string;
    sheen: string;
    vignette: string;
    flash: string;
    motionMesh: number;
    motionSheen: number;
    motionA: number;
    motionB: number;
    motionC: number;
};

type AmbientPreset = Record<AmbientTheme, AmbientVariant>;

const AMBIENT_TRANSITION_MS = 760;
const AMBIENT_FOCUS_INTENSITY_FACTOR = 0.42;
const AMBIENT_FOCUS_MOTION_FACTOR = 1.18;

// Tema escuro aprovado como baseline visual.
// Não retrabalhar o dark sem nova direção explícita de design.
// O tema claro deve seguir a mesma composição, profundidade e movimento do dark.
const AMBIENT_PRESETS: Record<Tab, AmbientPreset> = {
    home: {
        light: {
            intensity: 0.74,
            base: 'linear-gradient(180deg, #eaf4ff 0%, #dbeaff 42%, #edf7ff 100%), radial-gradient(circle at 12% 14%, rgba(80, 160, 255, 0.24), transparent 34%), radial-gradient(circle at 88% 18%, rgba(56, 214, 255, 0.2), transparent 30%)',
            mesh: 'radial-gradient(circle at 12% 18%, rgba(52, 132, 255, 0.48), transparent 34%), radial-gradient(circle at 84% 16%, rgba(56, 214, 255, 0.38), transparent 33%), radial-gradient(circle at 52% 82%, rgba(118, 135, 255, 0.28), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 36%, rgba(227, 239, 255, 0.03) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(48, 132, 255, 0.58) 0%, rgba(48, 132, 255, 0.25) 34%, rgba(48, 132, 255, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(56, 214, 255, 0.48) 0%, rgba(56, 214, 255, 0.2) 34%, rgba(56, 214, 255, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(112, 128, 255, 0.38) 0%, rgba(112, 128, 255, 0.14) 34%, rgba(112, 128, 255, 0) 70%)',
            sheen: 'linear-gradient(122deg, rgba(255, 255, 255, 0) 22%, rgba(255, 255, 255, 0.34) 48%, rgba(74, 160, 255, 0.08) 58%, rgba(255, 255, 255, 0) 78%)',
            vignette: 'radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.16), transparent 38%), linear-gradient(180deg, rgba(250, 253, 255, 0) 0%, rgba(214, 229, 248, 0.2) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0) 62%)',
            motionMesh: 30,
            motionSheen: 24,
            motionA: 26,
            motionB: 30,
            motionC: 36
        },
        dark: {
            intensity: 0.6,
            base: 'linear-gradient(180deg, #071422 0%, #09192c 42%, #0f1826 100%)',
            mesh: 'radial-gradient(circle at 14% 18%, rgba(43, 129, 255, 0.36), transparent 38%), radial-gradient(circle at 82% 18%, rgba(29, 198, 255, 0.24), transparent 35%), radial-gradient(circle at 52% 82%, rgba(92, 116, 255, 0.22), transparent 42%)',
            veil: 'linear-gradient(180deg, rgba(7, 16, 29, 0.08) 0%, rgba(8, 17, 30, 0.24) 40%, rgba(8, 15, 27, 0.48) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(41, 138, 255, 0.48) 0%, rgba(41, 138, 255, 0.22) 34%, rgba(41, 138, 255, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(24, 214, 255, 0.34) 0%, rgba(24, 214, 255, 0.14) 34%, rgba(24, 214, 255, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(95, 122, 255, 0.28) 0%, rgba(95, 122, 255, 0.1) 34%, rgba(95, 122, 255, 0) 70%)',
            sheen: 'linear-gradient(120deg, rgba(143, 219, 255, 0) 24%, rgba(143, 219, 255, 0.23) 49%, rgba(83, 151, 255, 0.1) 58%, rgba(143, 219, 255, 0) 76%)',
            vignette: 'radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.03), transparent 42%), linear-gradient(180deg, rgba(5, 11, 21, 0.16) 0%, rgba(5, 11, 21, 0) 34%, rgba(4, 10, 18, 0.46) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(165, 220, 255, 0.24), rgba(165, 220, 255, 0) 60%)',
            motionMesh: 34,
            motionSheen: 26,
            motionA: 28,
            motionB: 34,
            motionC: 40
        }
    },
    conteudo: {
        light: {
            intensity: 0.38,
            base: 'linear-gradient(180deg, #edf7ff 0%, #e7f2ff 46%, #edf6ff 100%), radial-gradient(circle at 18% 16%, rgba(112, 192, 255, 0.12), transparent 30%), radial-gradient(circle at 80% 18%, rgba(122, 232, 255, 0.1), transparent 28%)',
            mesh: 'radial-gradient(circle at 18% 20%, rgba(60, 171, 255, 0.28), transparent 34%), radial-gradient(circle at 80% 16%, rgba(94, 228, 255, 0.24), transparent 34%), radial-gradient(circle at 56% 82%, rgba(102, 204, 222, 0.18), transparent 38%)',
            veil: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.07) 40%, rgba(241, 248, 255, 0.04) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(77, 180, 255, 0.38) 0%, rgba(77, 180, 255, 0.16) 34%, rgba(77, 180, 255, 0) 70%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(76, 224, 255, 0.34) 0%, rgba(76, 224, 255, 0.14) 34%, rgba(76, 224, 255, 0) 70%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(72, 199, 210, 0.26) 0%, rgba(72, 199, 210, 0.1) 34%, rgba(72, 199, 210, 0) 70%)',
            sheen: 'linear-gradient(128deg, rgba(255, 255, 255, 0) 24%, rgba(255, 255, 255, 0.24) 48%, rgba(255, 255, 255, 0.05) 58%, rgba(255, 255, 255, 0) 76%)',
            vignette: 'radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.1), transparent 38%), linear-gradient(180deg, rgba(249, 252, 255, 0) 0%, rgba(230, 240, 250, 0.12) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 62%)',
            motionMesh: 42,
            motionSheen: 32,
            motionA: 34,
            motionB: 40,
            motionC: 46
        },
        dark: {
            intensity: 0.36,
            base: 'linear-gradient(180deg, #08131e 0%, #0b1824 44%, #101821 100%)',
            mesh: 'radial-gradient(circle at 18% 22%, rgba(39, 166, 255, 0.2), transparent 36%), radial-gradient(circle at 80% 18%, rgba(58, 207, 255, 0.14), transparent 34%), radial-gradient(circle at 58% 82%, rgba(44, 194, 212, 0.12), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(8, 15, 25, 0.18) 0%, rgba(8, 16, 25, 0.34) 42%, rgba(9, 15, 23, 0.56) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(46, 154, 255, 0.28) 0%, rgba(46, 154, 255, 0.12) 34%, rgba(46, 154, 255, 0) 70%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(52, 212, 255, 0.22) 0%, rgba(52, 212, 255, 0.1) 34%, rgba(52, 212, 255, 0) 70%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(42, 189, 205, 0.18) 0%, rgba(42, 189, 205, 0.08) 34%, rgba(42, 189, 205, 0) 70%)',
            sheen: 'linear-gradient(124deg, rgba(120, 223, 255, 0) 24%, rgba(120, 223, 255, 0.16) 48%, rgba(79, 168, 255, 0.07) 58%, rgba(120, 223, 255, 0) 76%)',
            vignette: 'radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.02), transparent 40%), linear-gradient(180deg, rgba(6, 11, 18, 0.16) 0%, rgba(6, 11, 18, 0) 36%, rgba(5, 10, 16, 0.42) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(130, 220, 255, 0.18), rgba(130, 220, 255, 0) 60%)',
            motionMesh: 44,
            motionSheen: 34,
            motionA: 36,
            motionB: 42,
            motionC: 48
        }
    },
    exercicios: {
        light: {
            intensity: 0.34,
            base: 'linear-gradient(180deg, #edf6ff 0%, #e8f1ff 46%, #eef6ff 100%), radial-gradient(circle at 16% 18%, rgba(110, 180, 255, 0.12), transparent 30%), radial-gradient(circle at 82% 18%, rgba(116, 224, 255, 0.08), transparent 28%)',
            mesh: 'radial-gradient(circle at 16% 22%, rgba(57, 143, 255, 0.26), transparent 34%), radial-gradient(circle at 82% 16%, rgba(74, 212, 255, 0.2), transparent 32%), radial-gradient(circle at 60% 80%, rgba(125, 193, 255, 0.16), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 40%, rgba(241, 247, 255, 0.03) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(61, 136, 255, 0.34) 0%, rgba(61, 136, 255, 0.14) 34%, rgba(61, 136, 255, 0) 70%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(78, 214, 255, 0.3) 0%, rgba(78, 214, 255, 0.12) 34%, rgba(78, 214, 255, 0) 70%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(112, 164, 255, 0.24) 0%, rgba(112, 164, 255, 0.09) 34%, rgba(112, 164, 255, 0) 70%)',
            sheen: 'linear-gradient(124deg, rgba(255, 255, 255, 0) 24%, rgba(255, 255, 255, 0.22) 48%, rgba(255, 255, 255, 0.05) 58%, rgba(255, 255, 255, 0) 76%)',
            vignette: 'radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.08), transparent 38%), linear-gradient(180deg, rgba(250, 252, 255, 0) 0%, rgba(229, 238, 249, 0.12) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 60%)',
            motionMesh: 40,
            motionSheen: 30,
            motionA: 33,
            motionB: 39,
            motionC: 45
        },
        dark: {
            intensity: 0.32,
            base: 'linear-gradient(180deg, #09131d 0%, #0d1723 44%, #111821 100%)',
            mesh: 'radial-gradient(circle at 16% 22%, rgba(36, 121, 255, 0.2), transparent 36%), radial-gradient(circle at 82% 18%, rgba(62, 194, 255, 0.12), transparent 32%), radial-gradient(circle at 60% 82%, rgba(91, 141, 255, 0.12), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(7, 13, 22, 0.16) 0%, rgba(8, 15, 23, 0.34) 42%, rgba(9, 14, 22, 0.54) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(39, 128, 255, 0.28) 0%, rgba(39, 128, 255, 0.12) 34%, rgba(39, 128, 255, 0) 70%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(52, 196, 255, 0.18) 0%, rgba(52, 196, 255, 0.08) 34%, rgba(52, 196, 255, 0) 70%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(90, 145, 255, 0.18) 0%, rgba(90, 145, 255, 0.07) 34%, rgba(90, 145, 255, 0) 70%)',
            sheen: 'linear-gradient(124deg, rgba(128, 208, 255, 0) 24%, rgba(128, 208, 255, 0.14) 48%, rgba(78, 139, 255, 0.06) 58%, rgba(128, 208, 255, 0) 76%)',
            vignette: 'radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.02), transparent 40%), linear-gradient(180deg, rgba(6, 10, 17, 0.16) 0%, rgba(6, 10, 17, 0) 36%, rgba(5, 9, 16, 0.42) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(128, 208, 255, 0.16), rgba(128, 208, 255, 0) 60%)',
            motionMesh: 42,
            motionSheen: 32,
            motionA: 35,
            motionB: 41,
            motionC: 47
        }
    },
    simulador: {
        light: {
            intensity: 0.06,
            base: 'linear-gradient(180deg, #f3f5f8 0%, #eef1f5 100%)',
            mesh: 'radial-gradient(circle at 20% 22%, rgba(148, 163, 184, 0.08), transparent 42%), radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.05), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.06) 0%, rgba(148, 163, 184, 0) 68%)',
            sheen: 'linear-gradient(124deg, rgba(255, 255, 255, 0) 22%, rgba(255, 255, 255, 0.2) 48%, rgba(255, 255, 255, 0) 74%)',
            vignette: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(229, 234, 241, 0.12) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 60%)',
            motionMesh: 44,
            motionSheen: 34,
            motionA: 36,
            motionB: 42,
            motionC: 48
        },
        dark: {
            intensity: 0.05,
            base: 'linear-gradient(180deg, #17181b 0%, #1c1c1e 100%)',
            mesh: 'radial-gradient(circle at 20% 22%, rgba(148, 163, 184, 0.08), transparent 42%), radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.05), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(17, 18, 20, 0.16) 0%, rgba(17, 18, 20, 0.34) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.06) 0%, rgba(148, 163, 184, 0) 68%)',
            sheen: 'linear-gradient(124deg, rgba(255, 255, 255, 0) 22%, rgba(255, 255, 255, 0.08) 48%, rgba(255, 255, 255, 0) 74%)',
            vignette: 'linear-gradient(180deg, rgba(10, 10, 12, 0.1) 0%, rgba(10, 10, 12, 0.26) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(180, 190, 200, 0.12), rgba(180, 190, 200, 0) 60%)',
            motionMesh: 44,
            motionSheen: 34,
            motionA: 36,
            motionB: 42,
            motionC: 48
        }
    },
    gramatica: {
        light: {
            intensity: 0.18,
            base: 'linear-gradient(180deg, #f7f6ff 0%, #f3f1ff 48%, #f7f6ff 100%)',
            mesh: 'radial-gradient(circle at 18% 20%, rgba(147, 96, 255, 0.16), transparent 36%), radial-gradient(circle at 80% 18%, rgba(108, 131, 255, 0.12), transparent 34%), radial-gradient(circle at 56% 80%, rgba(207, 113, 255, 0.1), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 255, 255, 0.16) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(147, 96, 255, 0.22) 0%, rgba(147, 96, 255, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(108, 131, 255, 0.18) 0%, rgba(108, 131, 255, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(207, 113, 255, 0.16) 0%, rgba(207, 113, 255, 0) 68%)',
            sheen: 'linear-gradient(124deg, rgba(255, 255, 255, 0) 22%, rgba(255, 255, 255, 0.24) 48%, rgba(255, 255, 255, 0) 74%)',
            vignette: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(235, 231, 245, 0.16) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 60%)',
            motionMesh: 40,
            motionSheen: 30,
            motionA: 34,
            motionB: 40,
            motionC: 46
        },
        dark: {
            intensity: 0.16,
            base: 'linear-gradient(180deg, #13111d 0%, #171522 46%, #1c1826 100%)',
            mesh: 'radial-gradient(circle at 18% 20%, rgba(147, 96, 255, 0.16), transparent 36%), radial-gradient(circle at 80% 18%, rgba(108, 131, 255, 0.12), transparent 34%), radial-gradient(circle at 56% 80%, rgba(207, 113, 255, 0.1), transparent 40%)',
            veil: 'linear-gradient(180deg, rgba(16, 14, 22, 0.16) 0%, rgba(16, 14, 22, 0.34) 100%)',
            orbA: 'radial-gradient(circle at 50% 50%, rgba(147, 96, 255, 0.2) 0%, rgba(147, 96, 255, 0) 68%)',
            orbB: 'radial-gradient(circle at 50% 50%, rgba(108, 131, 255, 0.16) 0%, rgba(108, 131, 255, 0) 68%)',
            orbC: 'radial-gradient(circle at 50% 50%, rgba(207, 113, 255, 0.14) 0%, rgba(207, 113, 255, 0) 68%)',
            sheen: 'linear-gradient(124deg, rgba(204, 184, 255, 0) 22%, rgba(204, 184, 255, 0.1) 48%, rgba(204, 184, 255, 0) 74%)',
            vignette: 'linear-gradient(180deg, rgba(10, 8, 16, 0.12) 0%, rgba(10, 8, 16, 0.28) 100%)',
            flash: 'radial-gradient(circle at 50% 50%, rgba(217, 184, 255, 0.12), rgba(217, 184, 255, 0) 60%)',
            motionMesh: 40,
            motionSheen: 30,
            motionA: 34,
            motionB: 40,
            motionC: 46
        }
    }
};

interface PageAmbientBackgroundProps {
    tab: Tab;
    transitionKey: number;
}

const toDuration = (seconds: number, multiplier: number) => `${(seconds * multiplier).toFixed(2)}s`;

export const PageAmbientBackground = ({ tab, transitionKey }: PageAmbientBackgroundProps) => {
    const { theme } = useTheme();
    const { effectiveReduceMotion, focusMode } = useUiSettings();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const preset = AMBIENT_PRESETS[tab][theme as AmbientTheme];
    const staticMode = effectiveReduceMotion || tab !== 'home';

    useEffect(() => {
        if (transitionKey === 0 || staticMode) {
            setIsTransitioning(false);
            return;
        }

        setIsTransitioning(true);
        const timeout = window.setTimeout(() => setIsTransitioning(false), AMBIENT_TRANSITION_MS);
        return () => window.clearTimeout(timeout);
    }, [transitionKey, staticMode]);

    const style = useMemo(() => {
        const intensity = focusMode
            ? Number((preset.intensity * AMBIENT_FOCUS_INTENSITY_FACTOR).toFixed(3))
            : preset.intensity;
        const motionMultiplier = focusMode ? AMBIENT_FOCUS_MOTION_FACTOR : 1;

        return {
            '--ambient-intensity': String(intensity),
            '--ambient-base': preset.base,
            '--ambient-mesh': preset.mesh,
            '--ambient-veil': preset.veil,
            '--ambient-sheen': preset.sheen,
            '--ambient-vignette': preset.vignette,
            '--ambient-flash': preset.flash,
            '--ambient-orb-a': preset.orbA,
            '--ambient-orb-b': preset.orbB,
            '--ambient-orb-c': preset.orbC,
            '--ambient-motion-mesh': toDuration(preset.motionMesh, motionMultiplier),
            '--ambient-motion-sheen': toDuration(preset.motionSheen, motionMultiplier),
            '--ambient-motion-a': toDuration(preset.motionA, motionMultiplier),
            '--ambient-motion-b': toDuration(preset.motionB, motionMultiplier),
            '--ambient-motion-c': toDuration(preset.motionC, motionMultiplier)
        } as CSSProperties;
    }, [focusMode, preset]);

    return (
        <div
            aria-hidden="true"
            className={`page-ambient page-ambient--${tab} ${staticMode ? 'is-static' : ''} ${isTransitioning ? 'is-transitioning' : ''}`}
            style={style}
        >
            <div className="page-ambient__base" />
            <div className="page-ambient__veil" />
            <div className="page-ambient__mesh" />
            <div className="page-ambient__orb page-ambient__orb--a" />
            <div className="page-ambient__orb page-ambient__orb--b" />
            <div className="page-ambient__orb page-ambient__orb--c" />
            <div className="page-ambient__sheen" />
            <div className="page-ambient__vignette" />
            <div className="page-ambient__flash" />
        </div>
    );
};
