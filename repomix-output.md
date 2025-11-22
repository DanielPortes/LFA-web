This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
eslint.config.js
index.html
package.json
postcss.config.js
public/vite.svg
README.md
src/App.css
src/App.tsx
src/assets/react.svg
src/components/automaton/AutomatonCanvas.tsx
src/components/automaton/AutomatonEditor.tsx
src/data/constants.ts
src/hooks/ThemeContext.tsx
src/index.css
src/main.tsx
src/pages/Content.tsx
src/pages/Exercises.tsx
src/pages/Home.tsx
src/pages/Simulator.tsx
src/types.ts
src/utils/geometry.ts
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

# Files

## File: .gitignore
````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
````

## File: eslint.config.js
````javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            'react-hooks/exhaustive-deps': 'warn'
        },
    },
)
````

## File: index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>temp_project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: package.json
````json
{
  "name": "temp_project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/postcss": "^4.1.17",
    "lucide-react": "^0.554.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.22",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
````

## File: postcss.config.js
````javascript
export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
}
````

## File: public/vite.svg
````
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
````

## File: README.md
````markdown
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
````

## File: src/App.css
````css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
````

## File: src/App.tsx
````typescript
import { useState } from 'react';
import { ThemeProvider, useTheme } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { Home, Book, PenTool, Code, Sun, Moon, LayoutGrid } from 'lucide-react';

import { HomeSection } from './pages/Home';
import { ConteudoSection } from './pages/Content';
import { ExerciciosSection } from './pages/Exercises';
import { SimulatorPage } from './pages/Simulator';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Navbar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const { theme, toggleTheme } = useTheme();
    const menuItems = [
        { id: 'home' as const, label: 'Início', icon: Home },
        { id: 'conteudo' as const, label: 'Material', icon: Book },
        { id: 'exercicios' as const, label: 'Exercícios', icon: PenTool },
        { id: 'simulador' as const, label: 'Simulador', icon: Code },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-2 py-1.5 flex items-center shadow-apple-lg">
            {/* Mobile Logo */}
            <div className="md:hidden pl-4 pr-2 flex items-center">
                <LayoutGrid className="text-ios-blue" size={20} />
            </div>

            <nav className="flex items-center gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative px-5 py-2.5 rounded-full transition-all duration-300 group flex items-center gap-2
                                ${isActive
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-ios-blue rounded-full shadow-lg shadow-blue-500/30 -z-10 animate-scale-in" />
                            )}
                            <Icon size={18} strokeWidth={2.5} className="relative z-10" />
                            <span className={`text-sm font-semibold relative z-10 hidden md:block ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="w-px h-5 bg-gray-300 dark:bg-white/10 mx-3 hidden md:block"></div>

            <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};

function MainApp() {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [simuladorData, setSimuladorData] = useState<AutomatoData | undefined>(undefined);

    const handleSimulationRequest = (data: AutomatoData) => {
        setSimuladorData(data);
        setActiveTab('simulador');
    };

    return (
        <div className="min-h-screen flex flex-col pb-6 relative font-sans">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-28 transition-all duration-500">
                <div className={`transition-opacity duration-300 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                    <HomeSection onNavigate={setActiveTab} />
                </div>
                {activeTab === 'conteudo' && <ConteudoSection />}
                {activeTab === 'exercicios' && <ExerciciosSection onSimulate={handleSimulationRequest} />}
                {activeTab === 'simulador' && <SimulatorPage initialData={simuladorData} />}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <MainApp />
        </ThemeProvider>
    );
}
````

## File: src/assets/react.svg
````
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
````

## File: src/components/automaton/AutomatonCanvas.tsx
````typescript
import React, { useRef, useState, useMemo, useEffect } from 'react';
import type { Estado, Transicao, AutomatoData, Tool } from '../../types';
import { calculatePath, getLabelPosition, getMousePos } from '../../utils/geometry';

interface CanvasProps {
    data: AutomatoData;
    tool: Tool;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    readOnly?: boolean;
    zoom?: number;
    onInteract?: () => void;
}

export const AutomatonCanvas: React.FC<CanvasProps> = ({
                                                           data,
                                                           tool,
                                                           onChange,
                                                           activeStates = [],
                                                           readOnly = false,
                                                           zoom = 1,
                                                           onInteract
                                                       }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Interaction State
    const [selection, setSelection] = useState<{ type: 'state' | 'transition', id: string } | null>(null);
    const [draggingStateId, setDraggingStateId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [creatingTransition, setCreatingTransition] = useState<{ from: string, toPoint: { x: number, y: number } } | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Area Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);

    // Shortcuts for Delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (readOnly) return;
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selection?.type === 'state') {
                    deleteState(selection.id);
                } else if (selection?.type === 'transition') {
                    deleteTransition(selection.id);
                } else if (selectedStateIds.length > 0) {
                    const newEstados = data.estados.filter(e => !selectedStateIds.includes(e.id));
                    const newTransicoes = data.transicoes.filter(t => !selectedStateIds.includes(t.de) && !selectedStateIds.includes(t.para));
                    onChange({ ...data, estados: newEstados, transicoes: newTransicoes });
                    setSelectedStateIds([]);
                    setSelection(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, selectedStateIds, data, readOnly]);

    const deleteState = (id: string) => {
        onChange({
            ...data,
            estados: data.estados.filter(e => e.id !== id),
            transicoes: data.transicoes.filter(t => t.de !== id && t.para !== id)
        });
        setSelection(null);
    };

    const deleteTransition = (id: string) => {
        onChange({ ...data, transicoes: data.transicoes.filter(t => t.id !== id) });
        setSelection(null);
    };

    // Helper to get mouse position adjusted for zoom and pan
    const getAdjustedMousePos = (e: React.MouseEvent) => {
        const pos = getMousePos(e, svgRef.current);
        return {
            x: (pos.x - pan.x) / zoom,
            y: (pos.y - pan.y) / zoom
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (onInteract) onInteract();

        if ((e.button === 1 || e.shiftKey) || (tool === 'pointer' && e.target === svgRef.current && !e.ctrlKey)) {
            if (e.button === 1 || e.shiftKey) {
                setIsPanning(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }
        }

        if (readOnly) return;

        if (e.target === svgRef.current) {
            if (tool === 'state') {
                const pos = getAdjustedMousePos(e);
                const newState: Estado = {
                    id: `q${Date.now()}`,
                    label: `q${data.estados.length}`,
                    x: pos.x,
                    y: pos.y,
                    isFinal: false,
                    isInicial: data.estados.length === 0
                };
                onChange({ ...data, estados: [...data.estados, newState] });
            } else if (tool === 'pointer') {
                const pos = getAdjustedMousePos(e);
                setIsSelecting(true);
                setSelectionStart(pos);
                setSelectionEnd(pos);
                setSelection(null);
                setSelectedStateIds([]);
            } else {
                setSelection(null);
            }
        }
    };

    const handleStateMouseDown = (e: React.MouseEvent, stateId: string) => {
        if (onInteract) onInteract();
        if (readOnly) return;
        e.stopPropagation();

        if (tool === 'delete') {
            deleteState(stateId);
            return;
        }

        const pos = getAdjustedMousePos(e);
        const currentState = data.estados.find(s => s.id === stateId);

        if (tool === 'transition') {
            setCreatingTransition({ from: stateId, toPoint: { x: pos.x, y: pos.y } });
        } else {
            if (!selectedStateIds.includes(stateId)) {
                setSelection({ type: 'state', id: stateId });
                setSelectedStateIds([stateId]);
            }

            if (currentState) {
                setDraggingStateId(stateId);
                setDragOffset({
                    x: pos.x - currentState.x,
                    y: pos.y - currentState.y
                });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
            return;
        }

        const pos = getAdjustedMousePos(e);

        if (readOnly) return;

        if (isSelecting) {
            setSelectionEnd(pos);
            return;
        }

        if (draggingStateId) {
            if (selectedStateIds.includes(draggingStateId) && selectedStateIds.length > 1) {
                // Simplificação: move apenas o clicado por enquanto para evitar bugs complexos sem cálculo de delta
                // Idealmente: calcular delta e aplicar a todos.
                onChange({
                    ...data,
                    estados: data.estados.map(st =>
                        st.id === draggingStateId
                            ? { ...st, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
                            : st
                    )
                });
            } else {
                onChange({
                    ...data,
                    estados: data.estados.map(st =>
                        st.id === draggingStateId
                            ? { ...st, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
                            : st
                    )
                });
            }
        } else if (creatingTransition) {
            setCreatingTransition({ ...creatingTransition, toPoint: { x: pos.x, y: pos.y } });
        }
    };

    const handleMouseUp = () => {
        if (isSelecting) {
            const x1 = Math.min(selectionStart.x, selectionEnd.x);
            const y1 = Math.min(selectionStart.y, selectionEnd.y);
            const x2 = Math.max(selectionStart.x, selectionEnd.x);
            const y2 = Math.max(selectionStart.y, selectionEnd.y);

            const selected = data.estados.filter(s =>
                s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2
            ).map(s => s.id);

            setSelectedStateIds(selected);
            if (selected.length === 1) {
                setSelection({ type: 'state', id: selected[0] });
            } else if (selected.length > 0) {
                setSelection(null);
            }
            setIsSelecting(false);
        }

        setIsPanning(false);
        setDraggingStateId(null);
        if (creatingTransition) setCreatingTransition(null);
    };

    const handleStateMouseUp = (e: React.MouseEvent, targetId: string) => {
        if (creatingTransition) {
            e.stopPropagation();
            const fromId = creatingTransition.from;
            const existing = data.transicoes.find(t => t.de === fromId && t.para === targetId && t.simbolo === 'λ');

            if (!existing) {
                const newTrans: Transicao = {
                    id: `t${Date.now()}`,
                    de: fromId,
                    para: targetId,
                    simbolo: 'λ',
                    curvatura: 0
                };
                onChange({ ...data, transicoes: [...data.transicoes, newTrans] });
                setSelection({ type: 'transition', id: newTrans.id });
            }
            setCreatingTransition(null);
        }
    };

    const renderTransitions = useMemo(() => {
        const groups: Record<string, Transicao[]> = {};

        data.transicoes.forEach(t => {
            const key = t.de < t.para ? `${t.de}-${t.para}` : `${t.para}-${t.de}`;
            const groupKey = t.de === t.para ? `loop-${t.de}` : key;
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(t);
        });

        const elements: React.ReactElement[] = [];

        Object.values(groups).forEach(group => {
            const count = group.length;
            const isLoop = group[0].de === group[0].para;

            group.forEach((t, index) => {
                const source = data.estados.find(e => e.id === t.de);
                const target = data.estados.find(e => e.id === t.para);
                if (!source || !target) return;

                let curve = 0;

                if (isLoop) {
                    curve = -50 + (index * 25);
                } else {
                    const direction = t.de < t.para ? 1 : -1;
                    if (count === 1) {
                        curve = 0;
                    } else {
                        const spread = 50;
                        const centerOffset = (count - 1) * spread / 2;
                        const rawOffset = (index * spread) - centerOffset;
                        curve = rawOffset * direction;
                        if (Math.abs(curve) < 10 && count > 1) curve = 30 * direction;
                    }
                }

                const pathD = calculatePath(source, target, curve);
                const labelPos = getLabelPosition(source, target, curve);
                const isSelected = selection?.type === 'transition' && selection.id === t.id;
                const isActive = activeStates.includes(t.de) && activeStates.includes(t.para);

                elements.push(
                    <g key={t.id} onClick={(e) => { e.stopPropagation(); setSelection({ type: 'transition', id: t.id }); }} className="group/trans cursor-pointer">
                        <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" />
                        <path
                            d={pathD}
                            className={`transition-colors duration-300 fill-none 
                                ${isSelected ? 'stroke-ios-blue stroke-[2.5px] filter drop-shadow-md' :
                                isActive ? 'stroke-ios-green stroke-[2.5px]' :
                                    'stroke-[var(--stroke-idle)] stroke-2 group-hover/trans:stroke-[var(--stroke-hover)]'
                            }`}
                            markerEnd={`url(#${isSelected ? 'arrow-selected' : (isActive ? 'arrow-active' : 'arrow')})`}
                        />
                        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                            <rect
                                x="-14" y="-12" width="28" height="24" rx="8"
                                className={`transition-all duration-200 ${isSelected ? 'fill-ios-blue shadow-lg' :
                                    'fill-[var(--bg-card)] stroke-[var(--border-color)] stroke-1'
                                }`}
                            />
                            <text
                                dy="5" textAnchor="middle"
                                className={`text-[11px] font-mono font-bold select-none pointer-events-none ${isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'
                                }`}
                            >
                                {t.simbolo}
                            </text>
                        </g>
                    </g>
                );
            });
        });
        return elements;
    }, [data, selection, activeStates]);

    return (
        <div className="w-full h-full relative overflow-hidden select-none bg-[var(--canvas-bg)] transition-colors duration-500">
            <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

            <svg
                ref={svgRef}
                className={`w-full h-full touch-none outline-none ${tool === 'state' ? 'cursor-crosshair' : (isPanning ? 'cursor-grabbing' : 'cursor-default')}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-[var(--stroke-idle)]" />
                    </marker>
                    <marker id="arrow-selected" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-ios-blue" />
                    </marker>
                    <marker id="arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-ios-green" />
                    </marker>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {renderTransitions}

                    {creatingTransition && (
                        <line
                            x1={data.estados.find(e => e.id === creatingTransition.from)?.x}
                            y1={data.estados.find(e => e.id === creatingTransition.from)?.y}
                            x2={creatingTransition.toPoint.x}
                            y2={creatingTransition.toPoint.y}
                            stroke="#007AFF" strokeWidth="2" strokeDasharray="6,4"
                            className="pointer-events-none opacity-60"
                        />
                    )}

                    {/* Selection Box */}
                    {isSelecting && (
                        <rect
                            x={Math.min(selectionStart.x, selectionEnd.x)}
                            y={Math.min(selectionStart.y, selectionEnd.y)}
                            width={Math.abs(selectionEnd.x - selectionStart.x)}
                            height={Math.abs(selectionEnd.y - selectionStart.y)}
                            fill="rgba(0, 122, 255, 0.1)"
                            stroke="rgba(0, 122, 255, 0.5)"
                            strokeWidth="1"
                            rx="4"
                        />
                    )}

                    {data.estados.map(s => {
                        const isSelected = (selection?.type === 'state' && selection.id === s.id) || selectedStateIds.includes(s.id);
                        const isActive = activeStates.includes(s.id);
                        return (
                            <g
                                key={s.id}
                                transform={`translate(${s.x}, ${s.y})`}
                                onMouseDown={(e) => handleStateMouseDown(e, s.id)}
                                onMouseUp={(e) => handleStateMouseUp(e, s.id)}
                                className={`${draggingStateId === s.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                            >
                                {s.isInicial && (
                                    <path d="M -50 0 L -32 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" className="text-[var(--stroke-idle)] opacity-70" />
                                )}

                                <circle r="28" className="fill-transparent" />

                                <circle
                                    r={isSelected || isActive ? 28 : 26}
                                    className={`transition-all duration-200
                                        ${isActive ? 'fill-ios-green stroke-ios-green shadow-[0_0_15px_rgba(52,199,89,0.5)]' :
                                        (isSelected ? 'fill-ios-blue stroke-ios-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]' :
                                            'fill-[var(--bg-card)] stroke-[var(--stroke-idle)] hover:stroke-[var(--stroke-hover)]')}`}
                                    strokeWidth={isSelected || isActive ? 2.5 : 2}
                                />

                                {s.isFinal && (
                                    <circle r="22" fill="none" className={`pointer-events-none ${isActive || isSelected ? 'stroke-white' : 'stroke-[var(--stroke-idle)]'}`} strokeWidth="1.5" />
                                )}

                                <text dy="5" textAnchor="middle" className={`text-xs font-bold select-none pointer-events-none font-mono ${isActive || isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'}`}>
                                    {s.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {!readOnly && selection && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dock px-6 py-3 rounded-2xl flex items-center gap-5 animate-scale-in z-50">
                    {selection.type === 'state' ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Nome</span>
                                <input
                                    value={data.estados.find(e => e.id === selection.id)?.label || ''}
                                    onChange={(e) => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, label: e.target.value } : s) })}
                                    className="w-16 bg-transparent border-b border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center font-bold text-sm outline-none focus:border-ios-blue text-[var(--text-primary)]"
                                />
                            </div>
                            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isInicial: !s.isInicial } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isInicial ? 'bg-ios-blue border-ios-blue text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    Inicial
                                </button>
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isFinal: !s.isFinal } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isFinal ? 'bg-ios-purple border-ios-purple text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    Final
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Símbolo(s)</span>
                            <div className="flex gap-2">
                                <input
                                    value={data.transicoes.find(t => t.id === selection.id)?.simbolo || ''}
                                    onChange={(e) => onChange({ ...data, transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: e.target.value } : t) })}
                                    className="w-32 bg-gray-100 dark:bg-white/10 rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-[var(--text-primary)]"
                                    placeholder="ex: a,b"
                                    autoFocus
                                />
                                <button onClick={() => deleteTransition(selection.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
````

## File: src/components/automaton/AutomatonEditor.tsx
````typescript
import React, { useState } from 'react';
import type { AutomatoData, Tool } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';
import { MousePointer2, Plus, ArrowUpRight, Trash2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface EditorProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    readOnly?: boolean;
    onInteract?: () => void;
}

export const AutomatonEditor: React.FC<EditorProps> = ({ data, onChange, activeStates = [], readOnly = false, onInteract }) => {
    const [tool, setTool] = useState<Tool>('pointer');
    const [zoom, setZoom] = useState(1);

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover (V)' },
        { id: 'state', icon: Plus, label: 'Estado (S)' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição (T)' },
        { id: 'delete', icon: Trash2, label: 'Apagar (Del)' },
    ];

    // Shortcuts
    React.useEffect(() => {
        if (readOnly) return;
        const handleKeys = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key.toLowerCase()) {
                case 'v': setTool('pointer'); break;
                case 's': setTool('state'); break;
                case 't': setTool('transition'); break;
                case 'd': setTool('delete'); break;
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [readOnly]);

    const exportData = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `automato-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
    const handleZoomReset = () => setZoom(1);

    return (
        <div className="flex flex-col h-full relative group">
            {/* Toolbar - macOS Style Floating Palette */}
            {!readOnly && (
                <div className="absolute left-6 top-6 z-20 flex flex-col gap-4">
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        {tools.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id as Tool)}
                                className={`p-3 rounded-xl transition-all duration-200 relative group/tooltip ${tool === t.id
                                        ? 'bg-ios-blue text-white shadow-md'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                <t.icon size={20} strokeWidth={2.5} />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                    {t.label}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={exportData}
                            className="p-3 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Exportar JSON"
                        >
                            <Download size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute right-6 top-6 z-20 flex flex-col gap-1 glass-panel p-2 rounded-2xl shadow-apple-lg">
                <button onClick={handleZoomIn} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ZoomIn size={20} strokeWidth={2.5} />
                </button>
                <button onClick={handleZoomOut} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ZoomOut size={20} strokeWidth={2.5} />
                </button>
                <button onClick={handleZoomReset} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <RotateCcw size={18} strokeWidth={2.5} />
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative rounded-[24px] border border-gray-200 dark:border-white/10 bg-white dark:bg-black">
                {!readOnly && data.estados.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Plus className="text-gray-400" size={32} />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Clique para adicionar estados</p>
                    </div>
                )}

                <AutomatonCanvas
                    data={data}
                    onChange={onChange}
                    tool={readOnly ? 'pointer' : tool}
                    activeStates={activeStates}
                    readOnly={readOnly}
                    zoom={zoom}
                    onInteract={onInteract}
                />
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-6 right-6 pointer-events-none">
                <div className="glass-panel px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider flex gap-4 shadow-apple-md">
                    <span className="text-ios-blue">{data.tipo}</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 self-center"></span>
                    <span>{data.estados.length} Estados</span>
                    <span>{data.transicoes.length} Transições</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 self-center"></span>
                    <span>{Math.round(zoom * 100)}%</span>
                </div>
            </div>
        </div>
    );
};
````

## File: src/data/constants.ts
````typescript
import { Layers, Zap, Move, CheckCircle, Code, FileText } from 'lucide-react';
import type { Exercicio, Topic } from '../types';

export const topicos: Topic[] = [
    { id: 'afd', title: 'Autômatos Finitos Determinísticos', desc: 'Definição formal, processamento e construção.', icon: Layers },
    { id: 'lex', title: 'Definição Léxica', desc: 'Tokens, padrões e especificações léxicas.', icon: FileText },
    { id: 'afn', title: 'Autômatos Finitos Não-Determinísticos', desc: 'Não-determinismo e equivalência com AFD.', icon: Zap },
    { id: 'afne', title: 'AFN com Movimentos Vazios', desc: 'Transições epsilon e Fecho-ε.', icon: Move },
    { id: 'er', title: 'Expressões Regulares', desc: 'Álgebra das linguagens regulares.', icon: Code },
    { id: 'gr', title: 'Gramáticas Regulares', desc: 'Regras de produção e derivação.', icon: CheckCircle },
];

export const exerciciosDB: Record<string, Exercicio[]> = {
    afd: [
        {
            id: 1,
            pergunta: "Descreva informalmente o processamento de uma palavra em um AFD.",
            dica: "Considere a sequência de estados e símbolos.",
            respostaTexto: "O processamento ocorre partindo do estado inicial. Para cada símbolo lido da entrada, o autômato transita deterministicamente para um próximo estado com base na função de transição. Se a leitura terminar em um estado final, a palavra é aceita."
        },
        {
            id: 2,
            pergunta: "Dado um AFD M qualquer, Descreva informalmente a linguagem definida por M, ou seja L(M).",
            dica: "Conjunto de palavras.",
            respostaTexto: "L(M) é o conjunto de todas as palavras w que, ao serem processadas por M partindo do estado inicial, fazem o autômato parar em um dos estados finais."
        },
        {
            id: 3,
            pergunta: "Descreva informalmente o que é calculado pela função Pe (Programa Estendido/Função de Transição Estendida).",
            dica: "Pe recebe estado e palavra inteira.",
            respostaTexto: "A função Pe calcula o estado alcançado pelo autômato após ler toda uma sequência de símbolos (palavra) w, partindo de um determinado estado q."
        },
        {
            id: 4,
            pergunta: "Construa o Diagrama de Estados do AFD M=({0,1},{1,2,3,4},{(1,0,2)(1,1,4)(2,0,1)(2,1,3)(3,1,2)(3,0,4)(4,0,3)(4,1,1)},1,{4}).",
            dica: "Estado 1 é inicial, 4 é final. Siga as transições.",
            respostaTexto: "Autômato construído abaixo. Linguagem aceita palavras que levam ao estado 4.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q1', label: '1', x: 200, y: 200, isFinal: false, isInicial: true },
                    { id: 'q2', label: '2', x: 400, y: 200, isFinal: false, isInicial: false },
                    { id: 'q3', label: '3', x: 400, y: 400, isFinal: false, isInicial: false },
                    { id: 'q4', label: '4', x: 200, y: 400, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q1', para: 'q2', simbolo: '0', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'q4', simbolo: '1', curvatura: 0 },
                    { id: 't3', de: 'q2', para: 'q1', simbolo: '0', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q3', simbolo: '1', curvatura: 0 },
                    { id: 't5', de: 'q3', para: 'q2', simbolo: '1', curvatura: 0 },
                    { id: 't6', de: 'q3', para: 'q4', simbolo: '0', curvatura: 0 },
                    { id: 't7', de: 'q4', para: 'q3', simbolo: '0', curvatura: 0 },
                    { id: 't8', de: 'q4', para: 'q1', simbolo: '1', curvatura: 0 },
                ]
            }
        },
        {
            id: 5,
            pergunta: "Construa um AFD para palavras em {a,b} que começam com 'a' e terminam com 'b' onde |w| >= 3.",
            dica: "Caminho mínimo: a -> qualquer -> b.",
            respostaTexto: "Necessita de pelo menos 4 estados para garantir o comprimento e a sequência.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'start', x: 100, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'leu a', x: 250, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'meio', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'fim', x: 550, y: 300, isFinal: true, isInicial: false },
                    { id: 'qErro', label: 'erro', x: 250, y: 450, isFinal: false, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q0', para: 'qErro', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a,b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q2', simbolo: 'a', curvatura: -30 },
                    { id: 't5', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
                    { id: 't6', de: 'q3', para: 'q2', simbolo: 'a', curvatura: 20 },
                    { id: 't7', de: 'q3', para: 'q3', simbolo: 'b', curvatura: -30 },
                    { id: 't8', de: 'qErro', para: 'qErro', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        }
    ],
    lex: [
        {
            id: 1,
            pergunta: "Definição léxica para inteiros e números com ponto decimal (sem zeros à esquerda).",
            dica: "Use ? para opcional. Ex: parte inteira . parte fracionaria",
            respostaTexto: "ER: (0 | [1-9][0-9]*) ( . [0-9]+ )?"
        },
        {
            id: 2,
            pergunta: "Definição léxica para números em notação científica (sem zeros à esquerda).",
            dica: "Base + Expoente (E).",
            respostaTexto: "ER: (0 | [1-9][0-9]*) ( . [0-9]+ )? ( E [+-]? [0-9]+ )"
        },
        {
            id: 3,
            pergunta: "Definição léxica para operadores relacionais: <>, <=, >=, ==, >, <",
            dica: "Liste as opções literalmente.",
            respostaTexto: "<> | <= | >= | == | > | <"
        }
    ],
    afn: [
        {
            id: 1,
            pergunta: "AFN para palavras em {a,b} que terminam com 'aaa'.",
            dica: "Faça um loop no início e depois a sequência obrigatória.",
            respostaTexto: "q0 (loop a,b) -> q1(a) -> q2(a) -> q3(a, Final).",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'q3', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Prove que 'aa' não pertence a linguagem da questão 1.",
            dica: "Simule todos os caminhos possíveis no AFN.",
            respostaTexto: "Caminhos possíveis para 'aa': \n1) q0->q0->q0 (não final)\n2) q0->q0->q1 (não final)\n3) q0->q1->q2 (não final)\nComo nenhum caminho termina em q3, 'aa' é rejeitada."
        },
        {
            id: 3,
            pergunta: "AFN para palavras com estrutura xyx, onde |x|=2 e y pertence a {a,b}*.",
            dica: "O AFN deve 'adivinhar' qual é a string x de tamanho 2 no início (aa, ab, ba, ou bb) e verificar se ela se repete no final.",
            respostaTexto: "Ramifica-se do estado inicial para 4 caminhos (aa, ab, ba, bb).",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'start', x: 100, y: 300, isFinal: false, isInicial: true },
                    // Ramo AA
                    { id: 'qA1', label: 'a', x: 200, y: 150, isFinal: false, isInicial: false },
                    { id: 'qA2', label: 'aa', x: 300, y: 150, isFinal: false, isInicial: false },
                    { id: 'qA3', label: 'fim a', x: 450, y: 150, isFinal: false, isInicial: false },
                    { id: 'qAF', label: 'fim aa', x: 550, y: 150, isFinal: true, isInicial: false },
                    // Ramo BB (Simplificado para visualização, idealmente teria 4 ramos)
                    { id: 'qB1', label: 'b', x: 200, y: 450, isFinal: false, isInicial: false },
                    { id: 'qB2', label: 'bb', x: 300, y: 450, isFinal: false, isInicial: false },
                    { id: 'qB3', label: 'fim b', x: 450, y: 450, isFinal: false, isInicial: false },
                    { id: 'qBF', label: 'fim bb', x: 550, y: 450, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    // Caminho AA
                    { id: 't1', de: 'q0', para: 'qA1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'qA1', para: 'qA2', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'qA2', para: 'qA2', simbolo: 'a,b', curvatura: -30 }, // Loop Y
                    { id: 't4', de: 'qA2', para: 'qA3', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'qA3', para: 'qAF', simbolo: 'a', curvatura: 0 },
                    // Caminho BB
                    { id: 't6', de: 'q0', para: 'qB1', simbolo: 'b', curvatura: 0 },
                    { id: 't7', de: 'qB1', para: 'qB2', simbolo: 'b', curvatura: 0 },
                    { id: 't8', de: 'qB2', para: 'qB2', simbolo: 'a,b', curvatura: 30 }, // Loop Y
                    { id: 't9', de: 'qB2', para: 'qB3', simbolo: 'b', curvatura: 0 },
                    { id: 't10', de: 'qB3', para: 'qBF', simbolo: 'b', curvatura: 0 }
                ]
            }
        },
        {
            id: 4,
            pergunta: "Descreva formalmente L(M), sendo M um AFN , onde M=(A,Q,P,q,F).",
            dica: "Definição de aceitação por AFN.",
            respostaTexto: "L(M) = { w | existe pelo menos um caminho de transições partindo de q, consumindo w, que alcança algum estado em F }."
        },
        {
            id: 5,
            pergunta: "Atualize o pseudo-código de processamento de AFD para AFN.",
            dica: "Em vez de um estado atual, mantenha um CONJUNTO de estados atuais.",
            respostaTexto: "1. Atuais = {q0}\n2. Para cada símbolo c de w:\n3.   Próximos = {}\n4.   Para cada estado q em Atuais:\n5.     Adicione P(q, c) em Próximos\n6.   Atuais = Próximos\n7. Se Atuais intercepta F, Aceita. Senão, Rejeita."
        }
    ],
    afne: [
        {
            id: 1,
            pergunta: "Construir AFD equivalente ao AFN M1: ({a,b},{1,2,3},{(1,a,2),(2,b,1),(2,b,3),(3,a,1)},1,{1})",
            dica: "Use a tabela de transições de subconjuntos.",
            respostaTexto: "Estados do AFD serão subconjuntos de {1,2,3}. Inicial: {1}. Transições baseadas na união dos destinos.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q1', label: '{1}', x: 200, y: 300, isFinal: true, isInicial: true },
                    { id: 'q2', label: '{2}', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'q13', label: '{1,3}', x: 600, y: 300, isFinal: true, isInicial: false },
                    { id: 'qErro', label: 'Erro', x: 400, y: 500, isFinal: false, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'qErro', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q2', para: 'q13', simbolo: 'b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'qErro', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'q13', para: 'q2', simbolo: 'a', curvatura: 100 },
                    { id: 't6', de: 'q13', para: 'qErro', simbolo: 'b', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Calcule o fecho vazio de q0 no autômato M2.",
            dica: "Estados alcançáveis apenas por transições epsilon.",
            respostaTexto: "Fecho-ε(q0) = {q0, q1, q2} (pois q0->ε->q1->ε->q2)."
        },
        {
            id: 3,
            pergunta: "O que calcula a função FECHO-ε-estendido?",
            dica: "Aplica-se a um conjunto de estados.",
            respostaTexto: "Calcula o conjunto de todos os estados alcançáveis a partir de um conjunto de estados iniciais usando apenas transições vazias (ε)."
        },
        {
            id: 4,
            pergunta: "Em que classe de linguagens estão as linguagens definidas por um AFNe?",
            dica: "Equivalência.",
            respostaTexto: "Linguagens Regulares (a mesma classe dos AFDs e AFNs)."
        },
        {
            id: 5,
            pergunta: "Calcule o fecho vazio estendido de {q0,q2} no autômato M2.",
            dica: "União dos fechos individuais.",
            respostaTexto: "Fecho({q0,q2}) = Fecho(q0) U Fecho(q2) = {q0,q1,q2} U {q2} = {q0,q1,q2}."
        },
        {
            id: 6,
            pergunta: "Construir AFN M' equivalente ao AFNe M.",
            dica: "Adicione transições diretas onde havia caminhos com epsilon.",
            respostaTexto: "M' terá transições diretas 'pulando' os epsilons. Ex: q0->e->q1->a->q2 vira q0->a->q2.",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 200, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 400, y: 200, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 600, y: 200, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q2', simbolo: 'a', curvatura: 40 }, // Veio de q0->e->q1->a->q2
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 7,
            pergunta: "Minimize o AFD M dado.",
            dica: "Identifique estados equivalentes (indistinguíveis).",
            respostaTexto: "Estados {q3, q4} são finais e equivalentes. Estados {q0} e {q1} podem ser fundidos se tiverem mesmo comportamento.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'q34', label: 'q3,q4', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q34', simbolo: 'a', curvatura: 30 },
                    { id: 't4', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -30 },
                    { id: 't5', de: 'q2', para: 'q34', simbolo: 'a', curvatura: 0 },
                    { id: 't6', de: 'q34', para: 'q34', simbolo: 'a', curvatura: -30 },
                    { id: 't7', de: 'q34', para: 'q2', simbolo: 'b', curvatura: 40 }
                ]
            }
        },
        {
            id: 8,
            pergunta: "Na transformação AFNe -> AFN, como é calculado o conjunto de estados finais?",
            dica: "Se o fecho vazio atinge um final original...",
            respostaTexto: "Um estado q é final no novo AFN se o Fecho-ε(q) no original contém algum estado final do original."
        }
    ],
    er: [
        {
            id: 1,
            pergunta: "ER para {w | w tem concatenações com no máximo um par de a’s consecutivos}.",
            dica: "Zero 'aa' OU Um 'aa'.",
            respostaTexto: "((b+ab)*(a+ε)) + ((b+ab)*aa(b+ba)*)",
            respostaAutomato: {
                tipo: 'ER',
                estados: [
                    { id: 'q0', label: 'S', x: 100, y: 250, isFinal: true, isInicial: true },
                    { id: 'q1', label: 'a', x: 250, y: 250, isFinal: true, isInicial: false },
                    { id: 'q2', label: 'aa', x: 400, y: 250, isFinal: true, isInicial: false },
                    { id: 'q3', label: 'aaa', x: 550, y: 250, isFinal: false, isInicial: false } // Trap
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 20 },
                    { id: 't4', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -30 },
                    { id: 't6', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
                    { id: 't7', de: 'q3', para: 'q3', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Automato para ER: (ab + ba)* (aa + bb)",
            dica: "Concatenação de um loop de pares com um par final.",
            respostaTexto: "Estado inicial com loop de ab/ba, saindo para aa ou bb final.",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: '0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: '1', x: 300, y: 200, isFinal: false, isInicial: false },
                    { id: 'q2', label: '2', x: 300, y: 400, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'F', x: 500, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    // (ab + ba)*
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 20 },
                    { id: 't2', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 20 },
                    { id: 't3', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 20 },
                    { id: 't4', de: 'q2', para: 'q0', simbolo: 'a', curvatura: 20 },
                    // (aa + bb)
                    { id: 't5', de: 'q0', para: 'q3', simbolo: 'aa,bb', curvatura: 0 } // Simplificado visualmente
                ]
            }
        },
        {
            id: 3,
            pergunta: "Descreva a linguagem: (a + b)* (aa +bb)",
            dica: "Qualquer coisa seguida de...",
            respostaTexto: "Conjunto de palavras sobre {a,b} que terminam com 'aa' ou 'bb'."
        },
        {
            id: 4,
            pergunta: "Descreva a linguagem: ( b + ab)* (ε + a)",
            dica: "Analise a estrutura de pares e o final.",
            respostaTexto: "Palavras que não contêm 'aa'. (Qualquer 'a' é precedido por 'b' ou é o último caractere)."
        },
        {
            id: 6,
            pergunta: "ER para palavras em {a,b}* exceto a palavra vazia.",
            dica: "Pelo menos um caractere.",
            respostaTexto: "(a+b)(a+b)*"
        },
        {
            id: 7,
            pergunta: "ER para valores monetários negativos Ex: -R$ 1.000,00",
            dica: "Símbolo, espaço, milhar opcional.",
            respostaTexto: "-R\\$ [1-9][0-9]{0,2}(\\.[0-9]{3})*,[0-9]{2}"
        },
        {
            id: 8,
            pergunta: "ER: Começa com 'a' e termina 'b' OU começa com 'b' e termina 'a'.",
            dica: "União de dois casos.",
            respostaTexto: "a(a+b)*b + b(a+b)*a"
        },
        {
            id: 9,
            pergunta: "ER: Alterna a's e b's, não vazia. (Ex: ababa, b, a).",
            dica: "Não pode ter aa nem bb.",
            respostaTexto: "(a+b)( (a+b)(?!= \\1) )* ... Mais simples: (a(ba)*b? | b(ab)*a?)"
        },
        {
            id: 10,
            pergunta: "ER: Número par de a's (aceita vazia).",
            dica: "b* (a b* a b*)*",
            respostaTexto: "b* (a b* a b*)*"
        },
        {
            id: 11,
            pergunta: "ER: Número par de a's (não aceita vazia).",
            dica: "Mesma da anterior mas força pelo menos um símbolo.",
            respostaTexto: "(b+ (a b* a b*)*) | (b* a b* a b* (a b* a b*)*)"
        },
        {
            id: 12,
            pergunta: "ER: Número ímpar de a's.",
            dica: "Par de a's concatenado com mais um a.",
            respostaTexto: "b* a b* (a b* a b*)*"
        }
    ],
    gr: [
        {
            id: 1,
            pergunta: "Construa GR para G1 = ({S,D},{0..9},{S->D|DS, D->0|..|9},S)",
            dica: "Simula números inteiros positivos.",
            respostaTexto: "S -> 0S | ... | 9S | 0 | ... | 9",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'D', label: 'D', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'Fim', x: 600, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: '0..9', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'F', simbolo: '0..9', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Prove que '1234' pertence a L(G1) com árvore de derivação.",
            dica: "S -> DS -> 1S -> 1DS -> 12S...",
            respostaTexto: "S -> DS -> 1S -> 1DS -> 12S -> 12DS -> 123S -> 123D -> 1234."
        },
        {
            id: 3,
            pergunta: "GR para inteiros sem zeros à esquerda.",
            dica: "Primeiro dígito 1-9, depois 0-9.",
            respostaTexto: "S -> 1A | ... | 9A | 1 | ... | 9\nA -> 0A | ... | 9A | 0 | ... | 9 | ε",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 400, y: 300, isFinal: true, isInicial: false },
                    { id: 'F', label: 'F', x: 600, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'A', simbolo: '1..9', curvatura: 0 },
                    { id: 't2', de: 'S', para: 'F', simbolo: '1..9', curvatura: 40 },
                    { id: 't3', de: 'A', para: 'A', simbolo: '0..9', curvatura: -30 },
                    { id: 't4', de: 'S', para: 'F', simbolo: '0', curvatura: 80 } // Caso seja apenas "0"
                ]
            }
        },
        {
            id: 4,
            pergunta: "A Gramática G2 é regular? A -> 0C | 1B, etc...",
            dica: "Verifique se as produções seguem A -> aB ou A -> a.",
            respostaTexto: "Sim, é regular à direita (Type 3)."
        },
        {
            id: 5,
            pergunta: "Demonstre que 101010 pertence a L(G2).",
            dica: "A->1B->10D->101C->1010A->10101B->101010.",
            respostaTexto: "Derivação: A => 1B => 10D => 100B (Oops, D->0B) => ... seguir regras."
        },
        {
            id: 6,
            pergunta: "GR para palavras em {a,b}* terminando em 'aaa'.",
            dica: "Autômato equivalente: Loop -> a -> a -> a.",
            respostaTexto: "S -> aS | bS | aA\nA -> aB\nB -> a",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'B', label: 'B', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'A', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'A', para: 'B', simbolo: 'a', curvatura: 0 },
                    { id: 't4', de: 'B', para: 'F', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 7,
            pergunta: "GR para palavras onde o terceiro símbolo da direita para esquerda é 'a'.",
            dica: "aXX. S gera qualquer coisa até gerar aXX.",
            respostaTexto: "S -> aS | bS | aA\nA -> aB | bB\nB -> a | b",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'B', label: 'B', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'A', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'A', para: 'B', simbolo: 'a,b', curvatura: 0 },
                    { id: 't4', de: 'B', para: 'F', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        },
        {
            id: 8,
            pergunta: "GR alternando a's e b's, começando e terminando com 'a'.",
            dica: "Ex: a, aba, ababa.",
            respostaTexto: "S -> a | aB\nB -> bA\nA -> a | aB",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'B', label: 'B', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'A', label: 'A', x: 600, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 800, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'F', simbolo: 'a', curvatura: 40 },
                    { id: 't2', de: 'S', para: 'B', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'B', para: 'A', simbolo: 'b', curvatura: 0 },
                    { id: 't4', de: 'A', para: 'F', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'A', para: 'B', simbolo: 'a', curvatura: -40 }
                ]
            }
        }
    ]
};
````

## File: src/hooks/ThemeContext.tsx
````typescript
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
````

## File: src/index.css
````css
@import "tailwindcss";

@theme {
    /* Fonts */
    --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --font-mono: "SF Mono", "Menlo", "Monaco", "Courier New", monospace;

    /* Apple System Colors */
    --color-ios-blue: #007AFF;
    --color-ios-green: #34C759;
    --color-ios-indigo: #5856D6;
    --color-ios-orange: #FF9500;
    --color-ios-pink: #FF2D55;
    --color-ios-purple: #AF52DE;
    --color-ios-red: #FF3B30;
    --color-ios-teal: #5AC8FA;
    --color-ios-yellow: #FFCC00;
    --color-ios-gray: #8E8E93;

    /* Backgrounds & Surfaces */
    --color-ios-bg-light: #F2F2F7;
    --color-ios-bg-dark: #000000;

    /* Shadows */
    --shadow-apple-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
    --shadow-apple-md: 0 8px 24px rgba(0, 0, 0, 0.08);
    --shadow-apple-lg: 0 16px 32px rgba(0, 0, 0, 0.12);
    --shadow-apple-xl: 0 24px 48px rgba(0, 0, 0, 0.18);
}

@layer base {
    :root {
        /* Light Mode - High Contrast & Clean */
        --bg-primary: #F5F5F7; /* Apple Light Gray Background */
        --bg-card: rgba(255, 255, 255, 0.85);
        --bg-overlay: rgba(255, 255, 255, 0.95);
        --text-primary: #1C1C1E;
        --text-secondary: #6C6C70;
        --border-color: rgba(0, 0, 0, 0.1);
        --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        --grid-color: rgba(0, 0, 0, 0.08); /* Darker grid for visibility */
        --canvas-bg: #FFFFFF;
        --stroke-idle: #8E8E93;
        --stroke-hover: #3A3A3C;
    }

    .dark {
        /* Dark Mode - Deep & Rich */
        --bg-primary: #000000;
        --bg-card: rgba(28, 28, 30, 0.65);
        --bg-overlay: rgba(44, 44, 46, 0.75);
        --text-primary: #F5F5F7;
        --text-secondary: #98989D;
        --border-color: rgba(255, 255, 255, 0.12);
        --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        --grid-color: rgba(255, 255, 255, 0.08);
        --canvas-bg: #000000;
        --stroke-idle: #636366;
        --stroke-hover: #AEAEB2;
    }

    body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        font-family: var(--font-sans);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition: background-color 0.5s cubic-bezier(0.32, 0, 0.67, 0), color 0.5s ease;
        overflow-x: hidden;
        min-height: 100vh;
    }

    /* Enhanced Dark Mode Background - "Aurora" style */
    .dark body {
        background: radial-gradient(circle at 50% -20%, #1a1a2e 0%, #000000 60%);
    }

    .dark body::before {
        content: '';
        position: fixed;
        top: -40%;
        right: -20%;
        width: 80vw;
        height: 80vw;
        background: radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, transparent 60%);
        filter: blur(100px);
        z-index: -2;
        pointer-events: none;
        animation: breathe 10s ease-in-out infinite alternate;
    }

    .dark body::after {
        content: '';
        position: fixed;
        bottom: -40%;
        left: -20%;
        width: 80vw;
        height: 80vw;
        background: radial-gradient(circle, rgba(175, 82, 222, 0.12) 0%, transparent 60%);
        filter: blur(120px);
        z-index: -1;
        pointer-events: none;
        animation: breathe 15s ease-in-out infinite alternate-reverse;
    }

    @keyframes breathe {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(1.1); opacity: 1; }
    }
}

@layer utilities {
    .glass-panel {
        @apply backdrop-blur-xl border border-[var(--border-color)];
        background-color: var(--bg-card);
        box-shadow: var(--glass-shadow);
    }

    .glass-card {
        @apply backdrop-blur-xl border border-[var(--border-color)] rounded-[24px] transition-all duration-500;
        background-color: var(--bg-overlay);
        box-shadow: var(--glass-shadow);
    }

    .glass-dock {
        @apply backdrop-blur-2xl border border-[var(--border-color)] shadow-apple-xl;
        background-color: rgba(245, 245, 247, 0.7); /* Light mode distinct dock */
    }
    .dark .glass-dock {
        background-color: rgba(30, 30, 30, 0.6);
    }

    .btn-icon {
        @apply p-3 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center;
    }

    /* Input Reset */
    input {
        color-scheme: light dark;
    }
}

/* Pattern Adjustments */
.bg-grid-pattern {
    background-size: 40px 40px;
    background-image:
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 100%); /* Fade edges */
}
````

## File: src/main.tsx
````typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````

## File: src/pages/Content.tsx
````typescript
import { ArrowUpRight } from 'lucide-react';
import { topicos } from '../data/constants';

export const ConteudoSection = () => (
    <div className="max-w-6xl mx-auto pt-4 animate-fade-in">
        <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Material Didático</h2>
            <p className="text-lg text-[var(--text-secondary)]">Conceitos fundamentais organizados para estudo rápido.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicos.map((topic) => {
                const Icon = topic.icon;
                return (
                    <div key={topic.id} className="group relative overflow-hidden glass-card hover:shadow-apple-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20 opacity-0 group-hover:opacity-100"></div>

                        <button className="w-full h-full text-left p-8 flex flex-col relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 rounded-[18px] bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-ios-blue group-hover:scale-110 transition-all duration-300">
                                    <Icon size={26} strokeWidth={1.5} />
                                </div>
                                <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-300 group-hover:bg-ios-blue group-hover:border-transparent group-hover:text-white transition-all">
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 leading-tight group-hover:text-ios-blue transition-colors">
                                {topic.title}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                {topic.desc}
                            </p>
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
);
````

## File: src/pages/Exercises.tsx
````typescript
import { useState } from 'react';
import { Lightbulb, Eye, EyeOff, Play, ChevronRight, CheckCircle2, ListFilter } from 'lucide-react';
import type { AutomatoData } from '../types';
import { exerciciosDB } from '../data/constants';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';

export const ExerciciosSection = ({ onSimulate }: { onSimulate: (data: AutomatoData) => void }) => {
    const [activeCategory, setActiveCategory] = useState('afd');
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

    const categories = [
        { id: 'afd', label: 'AFDs' },
        { id: 'lex', label: 'Léxico' },
        { id: 'afn', label: 'AFNs' },
        { id: 'afne', label: 'AFNε' },
        { id: 'er', label: 'Regex' },
        { id: 'gr', label: 'Gramática' },
    ];

    const exercicios = exerciciosDB[activeCategory] || [];

    return (
        <div className="h-full flex flex-col md:flex-row gap-8 animate-fade-in pb-10">

            {/* Sidebar Navigation */}
            <div className="md:w-64 flex-shrink-0">
                <div className="glass-panel p-2 rounded-3xl sticky top-28">
                    <div className="flex items-center gap-2 px-4 py-3 text-gray-400 mb-1">
                        <ListFilter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tópicos</span>
                    </div>
                    <div className="space-y-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setRevealedHints({}); setRevealedAnswers({}); }}
                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex justify-between items-center group relative overflow-hidden
                                    ${activeCategory === cat.id
                                    ? 'text-white font-bold shadow-lg shadow-blue-500/20'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                            >
                                {activeCategory === cat.id && (
                                    <div className="absolute inset-0 bg-ios-blue -z-10" />
                                )}
                                {cat.label}
                                {activeCategory === cat.id && <ChevronRight size={14} className="opacity-80" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 space-y-6">
                <div className="flex items-end justify-between mb-4 px-2">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{categories.find(c => c.id === activeCategory)?.label}</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Lista de exercícios práticos</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-500">{exercicios.length} Questões</span>
                </div>

                {exercicios.map((ex) => (
                    <div key={ex.id} className="glass-card overflow-hidden group hover:shadow-apple-md">
                        <div className="p-8">
                            <div className="flex gap-5 items-start">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 font-mono font-bold text-lg flex items-center justify-center border border-gray-100 dark:border-white/5">
                                    {ex.id}
                                </span>
                                <h3 className="text-lg font-medium text-[var(--text-primary)] leading-relaxed pt-1">{ex.pergunta}</h3>
                            </div>

                            <div className="flex gap-3 mt-8 ml-14">
                                {ex.dica && (
                                    <button
                                        onClick={() => setRevealedHints(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                        className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${revealedHints[ex.id] ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                    >
                                        <Lightbulb size={14} className={revealedHints[ex.id] ? 'fill-current' : ''} />
                                        {revealedHints[ex.id] ? 'Esconder' : 'Dica'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setRevealedAnswers(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                    className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${revealedAnswers[ex.id] ? 'bg-blue-50 text-ios-blue dark:bg-blue-500/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    {revealedAnswers[ex.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {revealedAnswers[ex.id] ? 'Esconder' : 'Ver Resposta'}
                                </button>
                            </div>
                        </div>

                        {/* Hint Section */}
                        {revealedHints[ex.id] && ex.dica && (
                            <div className="mx-8 mb-6 ml-20 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl text-orange-700 dark:text-orange-300 text-sm animate-scale-in">
                                <span className="font-bold mr-2 block mb-1 uppercase tracking-wide text-xs">Pista</span>{ex.dica}
                            </div>
                        )}

                        {/* Answer Section */}
                        {revealedAnswers[ex.id] && (
                            <div className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 p-8 animate-fade-in">
                                <div className="ml-14">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={16} className="text-ios-green" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solução</span>
                                    </div>

                                    <p className="text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-mono text-sm bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                                        {ex.respostaTexto}
                                    </p>

                                    {ex.respostaAutomato && (
                                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse"></div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gabarito Visual</span>
                                                </div>
                                                <button
                                                    onClick={() => onSimulate(ex.respostaAutomato!)}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue/10 hover:bg-ios-blue text-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <Play size={12} fill="currentColor" />
                                                    Simular
                                                </button>
                                            </div>
                                            <div className="h-80 w-full bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative">
                                                <AutomatonEditor
                                                    data={ex.respostaAutomato}
                                                    onChange={() => { }}
                                                    readOnly={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
````

## File: src/pages/Home.tsx
````typescript
import {Info, Move, Calendar, Clock, MapPin, ChevronRight, Play, Code} from 'lucide-react';
import type { Tab } from '../types';

export const HomeSection = ({ onNavigate }: { onNavigate: (t: Tab) => void }) => (
    <div className="animate-fade-in space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[32px] bg-black text-white shadow-apple-xl group min-h-[400px] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1e] to-black"></div>

            {/* Subtle animated background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-600/30 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 group-hover:bg-purple-600/30 transition-all duration-1000"></div>

            <div className="relative p-12 w-full z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> DCC063 • 2025
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.05]">
                        Linguagens <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Formais.</span>
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg font-medium">
                        Explore o universo dos autômatos. Teoria completa, exercícios desafiadores e um simulador visual de alta performance.
                    </p>
                    <button
                        onClick={() => onNavigate('simulador')}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-3"
                    >
                        <Play fill="currentColor" size={18} />
                        Começar a Simular
                    </button>
                </div>

                {/* Decorative Graphic */}
                <div className="hidden md:flex relative w-80 h-80 items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                    <div className="glass-panel w-24 h-24 rounded-full flex items-center justify-center z-20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <Code className="text-white" size={32} />
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Info Card */}
            <div className="col-span-1 glass-card p-8 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-ios-blue">
                            <Info size={20} />
                        </div>
                        Informações
                    </h3>
                    <ul className="space-y-4">
                        {[
                            { icon: MapPin, t: "Sala 308", s: "Bloco C" },
                            { icon: Clock, t: "Seg/Qua 14h", s: "Teoria" },
                            { icon: Calendar, t: "Qui 14h", s: "Prática" }
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <div className="text-gray-400 group-hover:text-ios-blue transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <span className="block font-semibold text-sm text-[var(--text-primary)]">{item.t}</span>
                                    <span className="text-xs text-gray-500">{item.s}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Timeline */}
            <div className="md:col-span-2 glass-card p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-ios-purple">
                        <Move size={20} />
                    </div>
                    Cronograma
                </h3>

                <div className="relative flex justify-between items-center px-8">
                    <div className="absolute left-12 right-12 h-0.5 bg-gray-200 dark:bg-white/10 top-[18px] -z-10" />
                    {[
                        { l: 'Intro', d: 'Concluído', s: 'done' },
                        { l: 'Prova 1', d: '24/11', s: 'active' },
                        { l: 'Prova 2', d: '12/01', s: 'next' },
                        { l: 'Final', d: '20/01', s: 'next' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 relative group">
                            <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center shadow-lg transition-all duration-300 z-10 ${
                                item.s === 'done' ? 'bg-ios-green border-ios-bg-light dark:border-ios-bg-dark text-white scale-100' :
                                    item.s === 'active' ? 'bg-ios-blue border-ios-bg-light dark:border-ios-bg-dark text-white ring-4 ring-blue-500/20 scale-110' :
                                        'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                                {item.s === 'done' && <ChevronRight size={16} strokeWidth={4} />}
                                {item.s !== 'done' && <div className={`w-2 h-2 rounded-full ${item.s === 'active' ? 'bg-white animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />}
                            </div>
                            <div className="text-center">
                                <span className={`block text-sm font-bold mb-1 ${item.s === 'active' ? 'text-ios-blue' : 'text-gray-500'}`}>{item.l}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{item.d}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
````

## File: src/pages/Simulator.tsx
````typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';
import type { AutomatoData, SimulationStep } from '../types';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, XCircle, X, Zap, Keyboard } from 'lucide-react';

interface SimulatorProps {
    initialData?: AutomatoData;
}

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Novo Autômato'
};

export const SimulatorPage: React.FC<SimulatorProps> = ({ initialData }) => {
    const [data, setData] = useState<AutomatoData>(initialData || emptyAutomaton);
    const [inputString, setInputString] = useState('');
    const [simulationState, setSimulationState] = useState<SimulationStep | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setData(prev => {
                if (JSON.stringify(prev) === JSON.stringify(initialData)) return prev;
                return initialData;
            });
            resetSimulation(true);
        }
    }, [initialData]);

    const resetSimulation = useCallback((fullReset = false) => {
        setIsPlaying(false);
        if (fullReset) {
            setSimulationState(null);
            setInputString('');
        } else {
            const initialStates = data.estados.filter(e => e.isInicial).map(e => e.id);
            setSimulationState({
                activeStates: initialStates,
                remainingInput: inputString,
                processedInput: '',
                status: 'running'
            });
        }
    }, [data, inputString]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(e.target.value);
        setSimulationState(null);
        setIsPlaying(false);
    };

    const clearInput = () => {
        setInputString('');
        setSimulationState(null);
        setIsPlaying(false);
        inputRef.current?.focus();
    };

    const step = useCallback(() => {
        let currentState = simulationState;

        if (!currentState) {
            const initialStates = data.estados.filter(e => e.isInicial).map(e => e.id);
            currentState = {
                activeStates: initialStates,
                remainingInput: inputString,
                processedInput: '',
                status: 'running'
            };
            setSimulationState(currentState);
            return;
        }

        if (currentState.status !== 'running') return;

        const currentSymbol = currentState.remainingInput[0];
        const nextActiveStates = new Set<string>();

        currentState.activeStates.forEach(stateId => {
            const transicoes = data.transicoes.filter(t => t.de === stateId);
            transicoes.forEach(t => {
                const simbolos = t.simbolo.split(',').map(s => s.trim());
                const match = simbolos.some(s => {
                    if (s === 'λ' || s === '') return false;
                    if (s === currentSymbol) return true;
                    if (s.includes('..') && currentSymbol) {
                        const [min, max] = s.split('..');
                        return currentSymbol >= min && currentSymbol <= max;
                    }
                    return false;
                });
                if (match) nextActiveStates.add(t.para);
            });
        });

        const nextStatesArray = Array.from(nextActiveStates);
        const nextRemaining = currentState.remainingInput.slice(1);
        let status: 'running' | 'accepted' | 'rejected' = 'running';

        if (currentState.remainingInput.length === 0) {
            const hasFinal = currentState.activeStates.some(id => data.estados.find(e => e.id === id)?.isFinal);
            status = hasFinal ? 'accepted' : 'rejected';
            setSimulationState(prev => prev ? { ...prev, status } : null);
            setIsPlaying(false);
            return;
        }

        if (nextStatesArray.length === 0) {
            status = 'rejected';
        }

        const newStep: SimulationStep = {
            activeStates: nextStatesArray,
            remainingInput: nextRemaining,
            processedInput: currentState.processedInput + (currentSymbol || ''),
            status
        };

        if (nextRemaining.length === 0 && status === 'running') {
            const hasFinal = nextStatesArray.some(id => data.estados.find(e => e.id === id)?.isFinal);
            newStep.status = hasFinal ? 'accepted' : 'rejected';
        }

        setSimulationState(newStep);
        if (newStep.status !== 'running') setIsPlaying(false);
    }, [simulationState, data, inputString]);

    useEffect(() => {
        let interval: number;
        if (isPlaying) {
            interval = setInterval(step, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, step, speed]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement === inputRef.current) {
                if (e.key === 'Enter') {
                    inputRef.current?.blur();
                    resetSimulation();
                    setIsPlaying(true);
                }
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!simulationState) resetSimulation();
                    setIsPlaying(p => !p);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setIsPlaying(false);
                    step();
                    break;
                case 'KeyR':
                    resetSimulation();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simulationState, isPlaying, step, resetSimulation]);

    return (
        // Container ocupa a tela inteira menos o navbar (considerando layout pai)
        <div className="absolute inset-x-0 bottom-0 top-24 animate-fade-in flex flex-col overflow-hidden">

            {/* Full Width Canvas Layer */}
            <div className="flex-1 relative z-0 bg-[var(--canvas-bg)]">
                <AutomatonEditor
                    data={data}
                    onChange={setData}
                    activeStates={simulationState?.activeStates}
                    readOnly={!!simulationState && simulationState.processedInput.length > 0}
                    onInteract={() => { if (simulationState) resetSimulation(true); }}
                />
            </div>

            {/* Floating Control Dock - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 w-full max-w-2xl px-4 pointer-events-none">

                {/* 1. Visual Tape - Só aparece quando tem input */}
                <div className={`glass-dock rounded-2xl p-3 transition-all duration-500 pointer-events-auto 
                    ${inputString ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                    <div className="flex items-center justify-between mb-2 px-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5
                             ${simulationState?.status === 'accepted' ? 'text-ios-green' :
                            simulationState?.status === 'rejected' ? 'text-ios-red' : 'text-gray-400'}`}>
                             {simulationState?.status === 'accepted' && <CheckCircle2 size={12} />}
                            {simulationState?.status === 'rejected' && <XCircle size={12} />}
                            {simulationState?.status === 'accepted' ? 'Aceito' : simulationState?.status === 'rejected' ? 'Rejeitado' : 'Fita de Leitura'}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                            {simulationState ? simulationState.processedInput.length : 0} / {inputString.length}
                        </span>
                    </div>

                    <div className="h-14 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex items-center justify-center overflow-hidden relative shadow-inner">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-ios-blue z-10 h-full opacity-40"></div>
                        <div
                            className="flex gap-2 absolute transition-all duration-300 ease-out will-change-transform"
                            style={{ transform: `translateX(calc(50% - ${(simulationState?.processedInput.length || 0) * 40 + 20}px))` }}
                        >
                            {inputString.split('').map((char, i) => {
                                const processedLen = simulationState?.processedInput.length || 0;
                                const isCurrent = i === processedLen;
                                const isProcessed = i < processedLen;

                                return (
                                    <div
                                        key={i}
                                        className={`w-8 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg transition-all duration-300
                                            ${isCurrent
                                            ? 'bg-ios-blue text-white scale-110 shadow-lg z-20'
                                            : (isProcessed
                                                ? 'text-[var(--text-secondary)] opacity-40 scale-95 blur-[0.5px]'
                                                : 'text-[var(--text-primary)] bg-white dark:bg-white/10 border border-[var(--border-color)]')
                                        }`}
                                    >
                                        {char}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Controls Bar */}
                <div className="glass-dock rounded-[24px] p-2 flex items-center justify-between gap-4 pointer-events-auto">

                    {/* Input Field Area */}
                    <div className="flex-1 flex items-center bg-[var(--bg-primary)] rounded-2xl px-3 py-1 border border-[var(--border-color)] focus-within:ring-2 focus-within:ring-ios-blue/30 transition-all">
                        <Keyboard size={16} className="text-gray-400 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputString}
                            onChange={handleInputChange}
                            placeholder="Digite a entrada..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono font-medium py-2 text-[var(--text-primary)] placeholder-gray-400"
                        />
                        {inputString && (
                            <button onClick={clearInput} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-300 dark:bg-white/10"></div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-2">
                        {/* Speed Trigger */}
                        <div className="flex bg-[var(--bg-primary)] rounded-xl p-0.5 border border-[var(--border-color)] mr-2">
                            {[1000, 500, 200].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all 
                                        ${speed === s
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-ios-blue'
                                        : 'text-gray-400 hover:text-[var(--text-primary)]'}`}
                                >
                                    {s === 1000 ? '1x' : s === 500 ? '2x' : <Zap size={12} />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => resetSimulation()}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-all"
                            title="Reiniciar (R)"
                        >
                            <RotateCcw size={18} />
                        </button>

                        <button
                            onClick={() => { if (!simulationState) resetSimulation(); setIsPlaying(!isPlaying); }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95
                                ${isPlaying ? 'bg-ios-orange shadow-orange-500/30' : 'bg-ios-blue shadow-blue-500/30'}`}
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={() => { if (!simulationState) resetSimulation(); step(); }}
                            disabled={isPlaying || (!!simulationState?.status && simulationState.status !== 'running')}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-all disabled:opacity-30"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
````

## File: src/types.ts
````typescript
import type { LucideIcon } from 'lucide-react';

export type Tab = 'home' | 'conteudo' | 'exercicios' | 'simulador';

export type Tool = 'pointer' | 'state' | 'transition' | 'delete';

export interface Estado {
    id: string;
    x: number;
    y: number;
    isFinal: boolean;
    isInicial: boolean;
    label: string;
}

export interface Transicao {
    id: string;
    de: string;
    para: string;
    simbolo: string;
    curvatura: number;
}

export interface AutomatoData {
    tipo: 'AFD' | 'AFN' | 'GR' | 'ER'; // Added GR and ER types
    estados: Estado[];
    transicoes: Transicao[];
    descricao?: string;
}

export interface Exercicio {
    id: number;
    pergunta: string;
    dica?: string;
    respostaTexto?: string;
    respostaAutomato?: AutomatoData;
}

export interface Topic {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
}

export interface SimulationStep {
    activeStates: string[];
    remainingInput: string;
    processedInput: string;
    status: 'running' | 'accepted' | 'rejected';
}
````

## File: src/utils/geometry.ts
````typescript
import type { Estado } from '../types';

/**
 * Retorna a posição do mouse relativa ao SVG.
 */
export const getMousePos = (e: React.MouseEvent | MouseEvent, svgRef: SVGSVGElement | null) => {
    if (!svgRef) return { x: 0, y: 0 };
    const CTM = svgRef.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
};

/**
 * Calcula um ponto ao longo de uma curva quadrática de Bézier.
 */
export const getQuadraticXY = (t: number, sx: number, sy: number, cp1x: number, cp1y: number, ex: number, ey: number) => {
    return {
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
    };
};

/**
 * Calcula o ponto de controle para criar a curvatura da aresta.
 */
export const calculateControlPoint = (source: Estado, target: Estado, curvature: number) => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Vetor normal unitário
    const nx = -dy / dist;
    const ny = dx / dist;

    // Aumentar curvatura se os estados estiverem muito próximos para evitar sobreposição visual
    const adjustedCurvature = dist < 100 && curvature !== 0 ? curvature * 1.5 : curvature;

    return {
        x: mx + nx * adjustedCurvature,
        y: my + ny * adjustedCurvature
    };
};

/**
 * Calcula a interseção entre uma linha (do ponto de controle) e a borda do círculo do estado.
 */
const getCircleIntersection = (centerX: number, centerY: number, radius: number, pointX: number, pointY: number) => {
    const dx = pointX - centerX;
    const dy = pointY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    return {
        x: centerX + (dx / dist) * radius,
        y: centerY + (dy / dist) * radius
    };
};

/**
 * Gera o caminho SVG (d) para a transição.
 */
export const calculatePath = (source: Estado, target: Estado, curvature: number = 0) => {
    const r = 28; // Raio do estado visual + padding

    // Loop (Auto-transição)
    if (source.id === target.id) {
        const x = source.x;
        const y = source.y;

        // Ajuste dinâmico baseado na curvatura (usada como offset de índice)
        const scale = 1 + Math.abs(curvature) / 60;
        const loopW = 40 * scale;
        const loopH = 50 * scale;
        const angle = -Math.PI / 2; // Topo

        // Ponto de ancoragem no círculo
        const anchorX = x + r * Math.cos(angle);
        const anchorY = y + r * Math.sin(angle);

        return `M ${anchorX - 10} ${anchorY} C ${x - loopW} ${y - loopH}, ${x + loopW} ${y - loopH}, ${anchorX + 10} ${anchorY}`;
    }

    // Transição entre estados distintos
    const cp = calculateControlPoint(source, target, curvature);

    // Encontrar ponto exato na borda do círculo de destino
    const end = getCircleIntersection(target.x, target.y, r + 4, cp.x, cp.y); // +4 para a ponta da seta não sobrepor a borda

    // Encontrar ponto exato na borda do círculo de origem
    const start = getCircleIntersection(source.x, source.y, r, cp.x, cp.y);

    return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
};

export const getLabelPosition = (source: Estado, target: Estado, curvature: number = 0) => {
    if (source.id === target.id) {
        const scale = 1 + Math.abs(curvature) / 60;
        return { x: source.x, y: source.y - (50 * scale) - 15 };
    }

    const cp = calculateControlPoint(source, target, curvature);
    // T=0.5 é o ponto médio da curva
    return getQuadraticXY(0.5, source.x, source.y, cp.x, cp.y, target.x, target.y);
};
````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    // In Tailwind v4, themes defined in CSS (@theme) take precedence.
    // We keep content and darkMode config here for compatibility.
    theme: {
        extend: {},
    },
    plugins: [],
}
````

## File: tsconfig.app.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"]
}
````

## File: tsconfig.json
````json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
````

## File: tsconfig.node.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
````

## File: vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
````
