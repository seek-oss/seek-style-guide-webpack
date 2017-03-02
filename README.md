# seek-style-guide-webpack

Webpack 2 decorators for integrating with the seek-style-guide.

## Installation

```bash
$ npm install --save-dev seek-style-guide-webpack
```

## Setup

First, decorate your server Webpack config:

```js
const decorateServerConfig = require('seek-style-guide-webpack').decorateServerConfig;

module.exports = decorateServerConfig({
  // Webpack config...
});
```

Then, decorate your client Webpack config:

```js
const decorateClientConfig = require('seek-style-guide-webpack').decorateClientConfig;
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCss = new ExtractTextPlugin({
  filename: 'style.css'
});

const config = {
  // Webpack config...
};

module.exports = decorateClientConfig(config, {
  // Ensure you pass your ExtractTextPlugin instance to the decorator, if required:
  extractTextPlugin: extractCss
});
```

Please note that, if your Webpack loaders aren't scoped to your local project files via the ["include" option](https://webpack.github.io/docs/configuration.html#module-loaders), the decorator will throw an error.

## License

MIT.
