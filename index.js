const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const chalk = require('chalk');
const incorrectStyleGuidePath = require('./incorrectStyleGuidePath');

const autoprefixerConfig = require('./autoprefixer.config');

const isProduction = () => process.env.NODE_ENV === 'production';

const styleGuidePath = path.dirname(require.resolve('seek-style-guide'));

const styleGuideModules = [
  'react',
  'theme',
  'fonts'
];

const getIncludePaths = (options) => {
  const extraIncludePaths = ((options && options.extraIncludePaths) || [])

  return {
    relative: [
      ...styleGuideModules.map(module => `seek-style-guide/${module}`),
      ...extraIncludePaths
    ],
    absolute: [
      ...styleGuideModules.map(module => path.resolve(styleGuidePath, module)),
      ...extraIncludePaths.map(include => path.dirname(require.resolve(include)))
    ]
  }
}

const resolveAliases = {
  'seek-style-guide': styleGuidePath
};

const singleLine = string =>
  string.replace(/^ +/gm, ' ').replace(/\n|\r/gm, '').trim();

const warn = message =>
  console.warn(
    chalk.yellow(`\nSEEK STYLE GUIDE WARNING:\n${singleLine(message)}\n`)
  );

const error = message => {
  throw new Error(
    chalk.red(`\nSEEK STYLE GUIDE ERROR:\n${singleLine(message)}\n`)
  );
};

const validateConfig = config => {
  if (incorrectStyleGuidePath) {
    error(
      `
        This module has resolved the style-guide path as ${require.resolve('seek-style-guide')}.
        That appears incorrect, did you link this module locally? Please unlink it,
        it does not resolve correctly when linked locally.
      `
    );
  }

  if (config.module.loaders !== undefined) {
    error(
      `
        You've configured your loaders with the legacy "module.loaders" field.
        Please use the newer "module.rules" format instead.
      `
    );
  }

  config.module.rules.forEach(rules => {
    if (!rules.include) {
      error(
        `
        The following rules config is missing an
        "include" value: ${rules.test}. This is required by 'seek-style-guide'
        in order to avoid rules clashes. More info:
        https://webpack.github.io/docs/configuration.html#module-loaders
      `
      );
    }
  });
};

const getLocalIdentName = () =>
  isProduction()
    ? '[hash:base64:7]'
    : '__STYLE_GUIDE__[name]__[local]___[hash:base64:7]';

const getCommonLoaders = (includes) => [
  {
    test: /\.js$/,
    include: includes,
    exclude: /\.raw\.js$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          presets: [
            [require.resolve('babel-preset-es2015'), { modules: false }],
            require.resolve('babel-preset-react')
          ],
          plugins: [
            require.resolve('babel-plugin-transform-class-properties'),
            require.resolve('babel-plugin-transform-object-rest-spread'),
            require.resolve('babel-plugin-add-react-displayname')
          ]
        }
      }
    ]
  },
  {
    test: /\.raw\.js$/,
    include: includes,
    use: [require.resolve('raw-loader'), require.resolve('uglify-loader')]
  },
  {
    test: /\.svg$/,
    include: includes,
    use: [
      require.resolve('raw-loader'),
      {
        loader: require.resolve('svgo-loader'),
        options: {
          plugins: [
            { addAttributesToSVGElement: { attribute: 'focusable="false"' } }
          ]
        }
      }
    ]
  }
];

const decorateConfig = (config, includes, options) => {
  const rules = options.rules || [];
  const plugins = options.plugins || [];
  const externals = options.externals;

  // Ensure config meets minimum requirements for decoration
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.plugins = config.plugins || [];

  validateConfig(config);

  // Prepend style guide loaders
  config.module.rules = getCommonLoaders(includes)
    .concat(rules)
    .concat(config.module.rules);

  // Prepend style guide plugins
  config.plugins = plugins.concat(config.plugins);

  // Provide externals, if provided
  if (externals) {
    if (config.externals) {
      warn(
        `
        You've provided "externals" in your Webpack config.
        This means that the style guide cannot provide its
        own externals for you. It's recommended that you
        delete your externals and let the style guide take
        care of it, otherwise you will have to manually keep
        your own externals in sync with the style guide.
      `
      );
    } else {
      config.externals = externals;
    }
  }

  // Add resolve aliases
  const consumerAliases = config.resolve && config.resolve.alias
    ? config.resolve.alias
    : {};

  for (var alias in resolveAliases) {
    if (
      consumerAliases[alias] && consumerAliases[alias] !== resolveAliases[alias]
    ) {
      error(`Resolve alias '${alias}' is reserved. Please rename it.\n`);
    } else {
      consumerAliases[alias] = resolveAliases[alias];
    }
  }

  config.resolve = config.resolve || {};
  config.resolve.alias = consumerAliases;

  return config;
};

const decorateServerConfig = (config, options) => {
  const { relative, absolute } = getIncludePaths(options);

  return decorateConfig(config, absolute, {
    externals: [
      nodeExternals({
        whitelist: relative
      })
    ],

    rules: [
      {
        test: /\.less$/,
        include: absolute,
        use: [
          {
            loader: require.resolve('css-loader/locals'),
            options: {
              modules: true,
              localIdentName: getLocalIdentName()
            }
          },
          require.resolve('less-loader')
        ]
      }
    ]
  });
}

const postcssPlugins = ({ cssSelectorPrefix } = {}) => 
  [require('autoprefixer')(autoprefixerConfig)]
    .concat(!cssSelectorPrefix ? [] : [
      require('postcss-prefix-selector')({
        prefix: `:global(${cssSelectorPrefix})`
      })
    ]);

const decorateClientConfig = (config, options) => {
  const extractTextPlugin = options && options.extractTextPlugin;
  const { absolute } = getIncludePaths(options);

  if (extractTextPlugin === ExtractTextPlugin) {
    error(
      `
      You appear to be passing in a reference to "ExtractTextPlugin"
      directly, rather than creating an instance via
      "new ExtractTextPlugin(...)". This causes incorrect CSS to be generated
      since the style guide also uses extract-text-webpack-plugin to
      generate its own CSS files for web fonts. As a result, it's
      important that you create your own instance of ExtractTextPlugin and
      pass it in instead. If you're not sure how to do this, you can see
      the Webpack documentation at
      https://github.com/webpack/extract-text-webpack-plugin/tree/webpack-1
    `
    );
  }

  const decorateStyleLoaders = extractTextPlugin
    ? loaders =>
        extractTextPlugin.extract({
          fallback: require.resolve('style-loader'),
          use: loaders
        })
    : loaders => [require.resolve('style-loader'), ...loaders];

  return decorateConfig(config, absolute, {
    rules: [
      {
        test: /\.less$/,
        include: absolute,
        use: decorateStyleLoaders([
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: true,
              minimize: isProduction(),
              localIdentName: getLocalIdentName(),
              importLoaders: 1
            }
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              plugins: () => postcssPlugins(options)
            }
          },
          require.resolve('less-loader')
        ])
      }
    ]
  });
};

module.exports = {
  decorateServerConfig,
  decorateClientConfig,
  autoprefixerConfig
};
