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