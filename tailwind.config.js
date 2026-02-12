import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Poppins', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', 'Merriweather', 'serif'],
            },
            colors: {
                coffee: {
                    dark: '#3E2723',
                    medium: '#5D4037',
                    light: '#8D6E63',
                },
                cream: {
                    dark: '#D7CCC8',
                    light: '#EFEBE9',
                    white: '#FFF8E1',
                },
                accent: {
                    orange: '#FF6F00',
                    amber: '#FFA726',
                }
            }
        },
    },

    plugins: [forms],
};