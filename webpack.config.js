const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const electronConfiguration = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'electron-main',
  plugins: [
    // This is the important part for onoff to work
    new webpack.ExternalsPlugin('commonjs', [
        'node-tesoro' 
    ]) 
  ],
  resolve: {
    alias: {
      ['@']: path.resolve(__dirname, 'src')
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      include: /src/,
      use: [{ loader: 'ts-loader' }]
    }]
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  },
};

const reactConfiguration = {
  mode: 'development',
  entry: './src/renderer.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  resolve: {
    alias: {
      ['@']: path.resolve(__dirname, 'src')
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        // Preprocess our own .css files
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000'
      }
    ]
  },
  output: {
    path: __dirname + '/dist',
    filename: 'renderer.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}

module.exports = [
  electronConfiguration,
  reactConfiguration
];