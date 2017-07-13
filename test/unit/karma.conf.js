// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

const webpackConfig = require('../../build/webpack.test.conf');

module.exports = function(config) {
    config.set({
        // to run in additional browsers:
        // 1. install corresponding karma launcher
        //    http://karma-runner.github.io/0.13/config/browsers.html
        // 2. add it to the `browsers` array below.
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 60000, //default 10000
        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'sinon-chai', 'phantomjs-shim', 'babel-polyfill'],
        reporters: ['mocha', 'clear-screen'],
        files: ['./index.js'],
        preprocessors: {
            './index.js': ['webpack', 'sourcemap'],
        },
        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true,
        },
    });
};
