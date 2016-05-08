module.exports = {
  entry: [
    './public/index.js'
  ],
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'index_bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './public'
  }
};
