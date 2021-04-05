const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackNodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

let config = {
  target: "node",
  entry: {
    server: path.join(__dirname, "src/index.js")
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "./dist")
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader"
        },
        exclude: [path.join(__dirname, "/node_modules")]
      }
    ]
  },
  externals: [webpackNodeExternals()],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

if (!isProd) {
  config = merge(config, {
    mode: "development",
    devtool: "eval-source-map",
    stats: { children: false }
  });
} else {
  config = merge(config, {
    mode: "production",
    stats: { children: false, warnings: false },
    optimization: {
      minimizer: [new TerserPlugin()],
      splitChunks: {
        cacheGroups: {
          commons: {
            name: "commons",
            chunks: "initial",
            minChunks: 3,
            enforce: true
          }
        }
      }
    }
  });
}

module.exports = config;
