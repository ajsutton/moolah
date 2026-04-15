// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// Detect OS color scheme preference
const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
        defaultTheme: darkMediaQuery.matches ? 'dark' : 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#F8FAFD',
                    surface: '#FFFFFF',
                    'surface-bright': '#FFFFFF',
                    'surface-light': '#F8FAFD',
                    'surface-variant': '#0A2370',
                    'on-surface-variant': '#F8FAFD',
                    primary: '#1E64EE',
                    'primary-darken-1': '#0A2370',
                    secondary: '#FFD56B',
                    'secondary-darken-1': '#E6B84D',
                    error: '#DC223B',
                    info: '#1E64EE',
                    success: '#1E64EE',
                    warning: '#FFD56B',
                },
                variables: {
                    'border-color': '#0A2370',
                    'border-opacity': 0.12,
                    'high-emphasis-opacity': 0.87,
                    'medium-emphasis-opacity': 0.6,
                    'disabled-opacity': 0.38,
                    'idle-opacity': 0.04,
                    'hover-opacity': 0.04,
                    'focus-opacity': 0.12,
                    'selected-opacity': 0.08,
                    'activated-opacity': 0.12,
                    'pressed-opacity': 0.12,
                    'dragged-opacity': 0.08,
                    'theme-kbd': '#0A2370',
                    'theme-on-kbd': '#FFFFFF',
                    'theme-code': '#F8FAFD',
                    'theme-on-code': '#0A2370',
                },
            },
            dark: {
                dark: true,
                colors: {
                    background: '#07102E',
                    surface: '#0B1739',
                    'surface-bright': '#0A2370',
                    'surface-light': '#0A2370',
                    'surface-variant': '#AAB4C8',
                    'on-surface-variant': '#07102E',
                    primary: '#1E64EE',
                    'primary-darken-1': '#7ABDFF',
                    secondary: '#FFD56B',
                    'secondary-darken-1': '#E6B84D',
                    error: '#FF787F',
                    info: '#7ABDFF',
                    success: '#7ABDFF',
                    warning: '#FFD56B',
                },
                variables: {
                    'border-color': '#AAB4C8',
                    'border-opacity': 0.12,
                    'high-emphasis-opacity': 0.87,
                    'medium-emphasis-opacity': 0.7,
                    'disabled-opacity': 0.38,
                    'idle-opacity': 0.04,
                    'hover-opacity': 0.04,
                    'focus-opacity': 0.12,
                    'selected-opacity': 0.08,
                    'activated-opacity': 0.12,
                    'pressed-opacity': 0.12,
                    'dragged-opacity': 0.08,
                    'theme-kbd': '#F8FAFD',
                    'theme-on-kbd': '#07102E',
                    'theme-code': '#07102E',
                    'theme-on-code': '#F8FAFD',
                },
            },
        },
    },
});

// Live-switch theme when OS preference changes
darkMediaQuery.addEventListener('change', (e) => {
    vuetify.theme.global.name.value = e.matches ? 'dark' : 'light';
});

export default vuetify;
