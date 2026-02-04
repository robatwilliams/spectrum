const browserify = require('@cypress/browserify-preprocessor');

module.exports = (on, config) => {
  const options = browserify.defaultOptions;
  options.browserifyOptions.transform[1][1].presets.push('@babel/preset-flow');
  on('file:preprocessor', browserify(options));

  // workaround for https://github.com/cypress-io/cypress/issues/789
  on('task', {
    async resetdb() {
      const teardown = require('../../shared/testing/teardown.js');
      const setup = require('../../shared/testing/setup.js');
      await teardown();
      await setup();
      return null;
    },
  });
};
