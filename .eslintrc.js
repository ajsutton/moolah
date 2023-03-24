module.exports = {
    extends: [
        'semistandard',
        'plugin:vue/recommended',
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
    },
    globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
    },
};
