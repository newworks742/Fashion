/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily:{
                 'noto-sans': ['Noto Sans', 'sans-serif'], // Changed from 'notoSans'
                 'roboto': ["Roboto","sans-serif"]
            },
            fontSize:{
                "1s":"9px",
                "2s":"10px",
                "md":"16px",
                "12xl":"12rem"
            },
            borderWidth:{
                "1":"1.5px"
            },
            colors:{
                heading:"#374151",
                description:"#4b5563",
                primary:{
                    '50': '#cfdfc5ff',
                    '100': '#d4e3cbff',
                    '200': '#d1eac4ff',
                    '300': '#86bc86ff',
                    '400': '#81c088ff',
                    '500': '#58bb47ff',
                    '600': '#369525ff',
                    '700': '#258514ff',
                    '800': '#19690aff',
                    '900': '#15440dff',
                    '950': '#1d2d1fff',
                }
            },
            animation:{
                loadingbar: 'loadingbar 1s ease-out infinite',
                'spin-slow': 'spin 3s linear infinite',
                'slow-bounce': 'bounce 4s infinite',
            },
           keyframes: {
               loadingbar: {
                   '0%' : {  width: '20%',transform: 'translateX(20%)'},
                   '20%': { width: '30%', transform: 'translateX(30%)' },
                   '40%': { width: '60%', transform: 'translateX(30%)'},
                   '60%': { width: '70%', transform: 'translateX(40%)'},
                   '80%': { width: '80%', transform: 'translateX(40%)' },
                   '100%': { width: '100%', transform: 'translateX(60%)' },
               }
           },
        }
    },
    plugins: [
        require('@tailwindcss/forms')
    ]
};