module.exports = {
    extends: ['semistandard', 'prettier'],
    ignorePatterns: ['dist/**'],
    rules: {
        'import/no-duplicates': ['off'],
        'import/no-webpack-loader-syntax': ['off'],
    },
    globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
    },
};
