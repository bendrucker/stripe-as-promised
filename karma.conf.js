'use strict';

module.exports = function (config) {
  config.set({
    frameworks: ['browserify', 'mocha'],
    files: [
      require.resolve('stripe-debug'),
      './test/*.js'
    ],
    preprocessors: {
      './test/*.js': 'browserify'
    },
    browsers: ['PhantomJS'],
    browserify: {
      debug: true,
      transform: [
        'babelify',
        ['exposify', {
          expose: {
           'stripe-debug': 'Stripe'
          }
        }]
      ]
    }
  });
}
