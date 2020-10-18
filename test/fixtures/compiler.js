import path from 'path';
import webpack from 'webpack';
// import memoryfs from 'memory-fs';
import { vol } from 'memfs';

export default (fixture, options = {}) => {
  const compiler = webpack({
    mode: 'none',
    context: __dirname,
    entry: path.resolve(__dirname, fixture),
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
        rules: [
              {
                // opal-webpack-bundler will compile and include ruby files in the pack
                test: /\.rb$/,
                use: [
                  {
                    loader: path.resolve(__dirname, '..', '..', './index.js'),
                    options: options
                  }
                ]
              }
            ]
        }
    });

  compiler.outputFileSystem = vol;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      var file = Object.values(vol.toJSON())[0];
      stats.output = file;
      resolve(stats);
    });
  });
};