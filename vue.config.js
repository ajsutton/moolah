module.exports = {
  configureWebpack: {
    resolve: {
      alias: require('./aliases.config').webpack
    }
  },

  css: {
    sourceMap: true
  },

  devServer: {
    proxy: {
      '/api/': {
        target: 'http://localhost:3000/',
      }
    },
  },

  pluginOptions: {
    karma: {
	  browsers: [ 'ChromeHeadless' ],
	}
  },

  assetsDir: 'static'
}
