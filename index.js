'use strict'

var stripeErrback = require('stripe-errback')
var promisify = require('./promisify')

module.exports = function promisifyStripe (Stripe, Promise) {
  if (typeof Stripe !== 'function') throw new Error('Stripe.js must be provided')
  if (typeof Promise !== 'function') throw new Error('Promise constructor must be provided')

  var stripe = stripeErrback(Stripe)
  return promisify(stripe, Promise)
}
