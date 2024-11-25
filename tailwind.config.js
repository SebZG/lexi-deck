/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html", // Include your HTML file
        "./src/**/*.{html,js}" // Include all HTML and JS files in the src directory
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui'),
    ],
    mode: process.env.NODE_ENV === 'production' ? 'jit' : undefined
};
