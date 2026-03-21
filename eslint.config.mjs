import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import vue from 'eslint-plugin-vue';
import vuetify from 'eslint-plugin-vuetify';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    // Ignore patterns
    includeIgnoreFile(gitignorePath),
    { ignores: ['dist/**/*'] },

    // JS recommended (replaces 'eslint:recommended')
    js.configs.recommended,

    // Vue flat config (replaces 'plugin:vue/essential' via compat)
    ...vue.configs['flat/essential'],

    // Vuetify flat config
    ...vuetify.configs['flat/base'],

    // Prettier (must come last to override formatting rules)
    eslintConfigPrettier,

    // Your overrides
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            }
        },
        rules: {
            'semi': ['error', 'always'],
            'import/no-duplicates': 'off',
            'import/no-webpack-loader-syntax': 'off',
            eqeqeq: 'off',
            'no-prototype-builtins': 'off',
            'no-new': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/valid-v-slot': 'off',
            'no-unused-vars': 'off',
        },
    },
];
