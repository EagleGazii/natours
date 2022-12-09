/* eslint-disable */
// const webpack = require('webpack');
// scripts:{
//     "webpack": "webpack --config webpack.config.js"
// }
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './public/js/index.js',
  output: {
    filename: 'main.js',
    // filename: 'main.[hash].js',

    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.pug$/,
        use: ['html-loader'],
      },
      // {
      //   test: /\.(js|jsx)$/,
      //   exclude: /(node_modules|bower_components)/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //     },
      //   },
      // },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './views/base.pug',
      inject: false,
    }),
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.join(__dirname, './views/base.pug'),
    //   //minify: false,
    // }),
    // new HtmlWebpackPugPlugin({
    //   adjustIndent: true,
    // }),
    //new PugPlugin(),
  ],
};

// entry: {
//   index: './views/base.pug',
//   footer: './views/_footer.pug',
//   header: './views/_header.pug',
//   reviewCard: './views/_reviewCard.pug',
//   error: './views/error.pug',
//   account: './views/account.pug',
//   login: './views/login.pug',
//   overview: './views/overview.pug',
//   signup: './views/signup.pug',
//   tour: './views/tour.pug',
// },
