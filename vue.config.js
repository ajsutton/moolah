const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports = {
    configureWebpack: {
        resolve: {
            alias: require('./aliases.config').webpack,
        },
        plugins: [
            // copy htaccess file
            new CopyPlugin([
                {
                    from: path.resolve(__dirname, '.htaccess'),
                    to: '',
                },
            ]),
        ],
    },

    css: {
        sourceMap: true,
    },

    devServer: {
        proxy: {
            '/api/': {
                target: 'http://localhost:3000/',
            },
        },
    },

    pluginOptions: {
        karma: {
            browsers: ['ChromeHeadless'],
        },
    },

    assetsDir: 'static',
};
