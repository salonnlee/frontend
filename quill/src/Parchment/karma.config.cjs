module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: ["test/parchment.js"],
    preprocessors: {
      "test/registry/*.js": ["babel"],
      "test/parchment.js": ["webpack"]
    },
    webpack: {
      entry: ["./parchment.js"],
      output: {
        filename: "parchment.js",
        library: "Parchment",
        libraryTarget: "umd",
        path: __dirname + "/dist"
      },
      resolve: {
        extensions: [".js"]
      },
      module: {},
      devtool: "source-map",
      mode: "production"
    },
    webpackMiddleware: {
      stats: {
        assets: false,
        chunks: false,
        colors: true,
        errorDetails: true,
        hash: false,
        timings: false,
        version: false
      }
    },
    exclude: [],
    reporters: ["progress"],
    coverageReporter: {
      dir: ".build/coverage",
      reporters: [{ type: "html" }, { type: "text" }, { type: "lcov" }]
    },
    browsers: ["Chrome"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true
  });
};
