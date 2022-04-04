const path = require('path');
const webpack = require('webpack');
const childProcess = require('child_process');
const Dotenv = require('dotenv-webpack');

// récupère la version à partir du tag git
let version = '';
try {
  version = childProcess.execSync('git describe --tags').toString();
} catch (e) {
  version = childProcess.execSync("git log -1 --format='%H'").toString();
}

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'static/flairsou_frontend'),
    filename: 'main.js',
    publicPath: '/static/flairsou_frontend/',
  },
  mode: 'development',
  plugins: [
    new Dotenv({
      path: '../flairsou/.env',
      defaults: '../flairsou/.env.defaults',
      safe: '../flairsou/.env.defaults',
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env', '@babel/preset-react'],
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              {
                legacy: true,
              },
            ],
            [
              '@babel/plugin-proposal-class-properties',
              {
                // loose: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|ttf|woff2?|otf|svg|png)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },
};
