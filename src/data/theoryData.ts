import type { CourseModule } from '../types';
import { mod0 } from './theory/modules/mod0_fundamentos';
import { mod1 } from './theory/modules/mod1_afd';
import { mod2 } from './theory/modules/mod2_afn';
import { mod3 } from './theory/modules/mod3_er';
import { mod4 } from './theory/modules/mod4_minimizacao';
import { mod5 } from './theory/modules/mod5_propriedades';
import { mod6 } from './theory/modules/mod6_gramaticas_regulares';
import { mod7 } from './theory/modules/mod7_fechamentos';
import { mod8 } from './theory/modules/mod8_aplicacoes';
import { mod9 } from './theory/modules/mod9_moore_mealy';
import { mod10 } from './theory/modules/mod10_glc';
import { mod11 } from './theory/modules/mod11_ap';
import { mod12 } from './theory/modules/mod12_chomsky';

// Re-export automata definitions if needed by other files, 
// though referencing them via courseModules is the primary way.
export * from './theory/automataDefs';

// ============================================================================
// ROTEIRO DE ESTUDO COMPLETO (P1)
// ============================================================================

export const courseModules: CourseModule[] = [
    mod0,
    mod1,
    mod2,
    mod3,
    mod4,
    mod5,
    mod6,
    mod7,
    mod8,
    mod9,
    mod10,
    mod11,
    mod12
];