import path from 'path';
import webpack from 'webpack';
import memoryfs from 'memory-fs';

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

  compiler.outputFileSystem = new memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      // console.dir(stats);
      // if (stats.hasErrors()) reject(new Error(stats.toJson().errors));
      resolve(stats);
    });
  });
};