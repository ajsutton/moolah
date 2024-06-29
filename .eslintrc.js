module.exports = {
    root: true,
    extends: [
        'semistandard',
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        'plugin:vuetify/recommended',
        'prettier',
    ],
    ignorePatterns: ['dist/**'],
    rules: {
        'import/no-duplicates': ['off'],
        'import/no-webpack-loader-syntax': ['off'],
        eqeqeq: ['off'],
        'no-prototype-builtins': ['off'],
        'no-new': ['off'],
        'vue/multi-word-component-names': ['off'],
    },
    globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
    },
    env: {
        es2022: true,
    }
};