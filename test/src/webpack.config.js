const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const decorateClientConfig = require('../../index').decorateClientConfig;
const decorateServerConfig = require('../../index').decorateServerConfig;

const appCss = new MiniCssExtractPlugin({
  filename: 'app.css'
});

// Must be absolute paths
const appPaths = [path.resolve(__dirname, 'app')];

const clientConfig = {
  mode: 'production',

  entry: path.resolve(__dirname, 'app/client-render'),

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js'
  },

  optimization: {
    nodeEnv: 'production',
    minimize: true,
    concatenateModules: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }], 'react'],
            plugins: ['seek-style-guide']
          }
        },
        include: appPaths
      },
      {
        test: /\.less$/,
        include: appPaths,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.svg$/,
        use: ['raw-loader', 'svgo-loader'],
        include: appPaths
      }
    ]
  },

  resolve: {
    modules: ['node_modules', 'wip_modules', 'components']
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    appCss
  ],

  stats: { children: false }
};

const serverConfig = {
  entry: {
    render: path.resolve(__dirname, 'app/server-render')
  },

  mode: 'production',

  target: 'node',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'render.js',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: appPaths,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }], 'react']
          }
        }
      },
      {
        test: /\.less$/,
        include: appPaths,
        exclude: /node_modules/,
        use: [
          {
            loader: 'css-loader/locals',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.svg$/,
        include: appPaths,
        use: ['raw-loader', 'svgo-loader']
      }
    ]
  },
  plugins: [new StaticSiteGeneratorPlugin('render', '/')]
};

module.exports = [
  decorateClientConfig(clientConfig, {
    cssOutputLoader: MiniCssExtractPlugin.loader
  }),
  decorateServerConfig(serverConfig)
];
