const path = require('path')

module.exports = {
  mode: 'development',

  entry: {
    'active_storage_drag_and_drop': path.resolve(__dirname, 'app/javascript/active_storage_drag_and_drop/index.js')
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app/assets/javascripts'),
    library: 'ActiveStorageDragAndDrop',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
