/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Prompt', 'sans-serif'],
                display: ['Kanit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
