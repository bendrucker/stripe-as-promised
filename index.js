'use strict'

var extend = require('xtend/mutable')
var dot = require('dot-prop')

var asyncMethods = [
  'card.createToken',
  'bankAccount.createToken',
  'bitcoinReceiver.createReceiver',
  'bitcoinReceiver.pollReceiver',
  'bitcoinReceiver.getReceiver',
]

var helperMethods = [
  'setPublishableKey',
  'card.validateCardNumber',
  'card.validateExpiry',
  'card.validateCVC',
  'card.cardType',
  'bankAccount.validateRoutingNumber',
  'bankAccount.validateAccountNumber',
  'bitcoinReceiver.cancelReceiverPoll'
]

module.exports = function promisifyStripe (Stripe, Promise) {
  if (typeof Stripe !== 'function') throw new Error('Stripe.js must be provided')
  if (typeof Promise !== 'function') throw new Error('Promise constructor must be provided')
  var stripe = {}
  asyncMethods.forEach(function (method) {
    var names = method.split('.')
    var receiverName = names[0]
    var methodName = names[1]
    dot.set(stripe, method, promisify(Promise, methodName, Stripe[receiverName], stripeResponseHandler))
  })
  helperMethods.forEach(function (method) {
    dot.set(stripe, method, dot.get(Stripe, method))
  })
  return stripe
}

function promisify (Promise, method, receiver, resolver) {
  return function promisified () {
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      receiver[method].apply(receiver, args.concat(function promisifiedResolve () {
        resolver.apply({resolve: resolve, reject: reject}, arguments)
      }))      
    })
  }
}

function stripeResponseHandler (status, response) {
  if (response.error) {
    this.reject(extend(new Error(), response.error))
  }
  else {
    this.resolve(response)
  }
}
