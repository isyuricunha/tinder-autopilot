const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const createExtensionConfig = ({ name, outputPath, manifestPath }) => ({
  name,
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'chrome/icons', to: 'icons' },
        { from: manifestPath, to: 'manifest.json' },
        { from: 'src/misc/bg.js', to: 'bg.js' }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  output: {
    path: outputPath,
    chunkLoading: false,
    wasmLoading: false
  },
  target: ['web', 'es5']
});

module.exports = [
  createExtensionConfig({
    name: 'chrome',
    outputPath: path.resolve(__dirname, 'dist'),
    manifestPath: 'chrome/manifest.json'
  }),
  createExtensionConfig({
    name: 'firefox',
    outputPath: path.resolve(__dirname, 'dist-firefox'),
    manifestPath: 'chrome/manifest.firefox.json'
  })
];
