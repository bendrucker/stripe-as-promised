'use strict'

var stripeErrback = require('stripe-errback')
var dot = require('dot-prop')
var pify = require('pify')

module.exports = promisify

function promisify (stripe, Promise) {
  stripeErrback.methods.async.forEach(function (path) {
    var fn = dot.get(stripe, path)
    dot.set(stripe, path, pify(fn, Promise))
  })

  return stripe
}
