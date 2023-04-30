const path = require('path');

module.exports = {
  entry: '.src/index.js', // Your application's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      crypto: false
    },
  }
  // Add other configurations as needed
};