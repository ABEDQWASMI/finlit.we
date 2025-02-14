const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const publicPath = isProduction ? 'https://leapthelimit.github.io/finlit.we/' : '/';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'widget.js',
      library: 'FinLitWidget',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this',
      publicPath: publicPath
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.svg$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
        {
          test: /\.json$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: 'body'
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets/images',
            to: 'images'
          }
        ]
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000,
      hot: true
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  };
}; 