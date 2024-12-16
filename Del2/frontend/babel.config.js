const styleXPlugin = require('@stylexjs/babel-plugin');

module.exports = {
  presets: [
    '@babel/preset-env',  // Modern JavaScript syntax support
    '@babel/preset-react' // React JSX syntax support
  ],
  plugins: [
    [
      styleXPlugin,
      {
        dev: true, // Enable debugging in development
        test: false, // Disable snapshot testing by default
      },
    ],
  ],
};
