module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    "@babel/transform-runtime",
	["transform-imports", {
	  "vuetify": {
	    "transform": "vuetify/es5/components/${member}",
		"preventFullImport": true
	  }
	}]
  ]
}
