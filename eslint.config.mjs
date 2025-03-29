import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import vue from 'eslint-plugin-vue';
import vuetify from 'eslint-plugin-vuetify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],

        // any additional configuration for these file types here
    },
    includeIgnoreFile(gitignorePath),
    {
        ignores: ['dist/**/*'],
    },
    ...compat.extends(
        'semistandard',
        'plugin:vue/essential',
        'eslint:recommended',
        'prettier'
    ),
    {
        languageOptions: {},

        rules: {
            'import/no-duplicates': ['off'],
            'import/no-webpack-loader-syntax': ['off'],
            eqeqeq: ['off'],
            'no-prototype-builtins': ['off'],
            'no-new': ['off'],
            'vue/multi-word-component-names': ['off'],
            'vue/valid-v-slot': ['off'],
        },
    },
    ...vue.configs['flat/base'],
    ...vuetify.configs['flat/base'],
];
