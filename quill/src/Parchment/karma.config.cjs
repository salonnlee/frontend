module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "test/parchment.js",
      "test/setup.js",
      "test/registry/*.js",
      "test/unit/LinkedList.js",
      "test/unit/registry.js",
      "test/unit/attributor.js",
      // "test/unit/blot.js",
      // "test/unit/parent.js",
      // "test/unit/scroll.js",
      // "test/unit/container.js",
      // "test/unit/block.js",
      // "test/unit/inline.js",
      // "test/unit/embed.js",
      "test/unit/text.js",
      // "test/unit/lifecycle.js"
    ],
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
