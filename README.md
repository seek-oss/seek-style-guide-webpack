[![Build Status](https://img.shields.io/travis/seek-oss/seek-style-guide-webpack/master.svg?style=flat-square)](http://travis-ci.org/seek-oss/seek-style-guide-webpack) [![npm](https://img.shields.io/npm/v/seek-style-guide-webpack.svg?style=flat-square)](https://www.npmjs.com/package/seek-style-guide-webpack) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

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
