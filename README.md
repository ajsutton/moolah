# Moolah

> Web front-end for a [Moolah server](https://github.com/ajsutton/moolah-server).

## Development Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```

The dev server expects an instance of moolah-server to be listening on http://localhost:3000/ to proxy API requests to. See the [Moolah server README](https://github.com/ajsutton/moolah-server) for instructions.

``` bash
# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
