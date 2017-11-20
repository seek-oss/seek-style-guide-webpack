const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const decorateClientConfig = require('../../index').decorateClientConfig;
const decorateServerConfig = require('../../index').decorateServerConfig;

const appCss = new ExtractTextPlugin({
  filename: 'app.css'
});

// Must be absolute paths
const appPaths = [path.resolve(__dirname, 'app')];

const clientConfig = {
  entry: path.resolve(__dirname, 'app/client-render'),

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }], 'react']
          }
        },
        include: appPaths
      },
      {
        test: /\.less$/,
        use: appCss.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            },
            'less-loader'
          ]
        }),
        include: appPaths
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
    appCss,
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    })
  ],

  stats: { children: false }
};

const serverConfig = {
  entry: {
    render: path.resolve(__dirname, 'app/server-render')
  },

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
    extractTextPlugin: appCss
  }),
  decorateServerConfig(serverConfig)
];
