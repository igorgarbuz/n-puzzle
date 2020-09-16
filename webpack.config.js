const { PRIORITY_NORMAL } = require('constants');
var path = require('path');
const { argv, config } = require('process');

const common_settings = {
  mode: "production",
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: ['node_modules']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      }
    ]
  }
};

const web = {
  ...common_settings,
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "bundle.js"
  },
};

const cli = {
  ...common_settings,
  target: "node",
  entry: "./src/solver/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "solver-cli.js"
  },
}

module.exports = (env, args) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
  }
  return [web, cli];
}
