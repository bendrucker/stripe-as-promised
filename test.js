'use strict'

var test = require('tape')
var extend = require('xtend')
var stub = require('sinon').stub
var Promise = require('native-promise-only')
var Stripe = window.Stripe
var stripeAsPromised = require('./')

test(function (t) {
  t.throws(stripeAsPromised, /Stripe/, 'requires Stripe')
  t.throws(function () {
    stripeAsPromised(function () {})
  }, /Promise/, 'requires Promise')

  var stripe = stripeAsPromised(Stripe, Promise)
  t.equal(stripe.card.validateCardNumber, Stripe.card.validateCardNumber, 'reference util method')

  t.test('createToken', function (t) {
    t.plan(4)
    stub(Stripe.card, 'createToken').yieldsAsync(200, {id: 'token'})
    var data = {}
    var params = {}
    stripe.card.createToken(data, params).then(function (res) {
      t.equal(res.id, 'token')
      t.equal(Stripe.card.createToken.callCount, 1)
      var args = Stripe.card.createToken.firstCall.args
      t.equal(args[0], data)
      t.equal(args[1], params)
      Stripe.card.createToken.restore()
    })
  })

  t.test('custom promise', function (t) {
    t.plan(4)

    var _stripe = stripeAsPromised(Stripe, function CustomPromise (resolver) {
      resolver(
        function resolve (data) {
          t.deepEqual(data, {id: 'token'})
        },
        t.fail
      )
    })

    stub(Stripe.card, 'createToken').yieldsAsync(200, {id: 'token'})
    var data = {}
    var params = {}
    _stripe.card.createToken(data, params).then(function (res) {
      t.equal(res.id, 'token')
      t.equal(Stripe.card.createToken.callCount, 1)
      var args = Stripe.card.createToken.firstCall.args
      t.equal(args[0], data)
      t.equal(args[1], params)
    })
  })

  t.test('errors', function (t) {
    t.plan(3)
    var response = {
      error: {
        message: 'Routing number must have 9 digits',
        param: 'bank_account',
        type: 'invalid_request_error'
      }
    }
    stub(Stripe.bankAccount, 'createToken').yieldsAsync(400, response)
    stripe.bankAccount.createToken({}, {}).catch(function (err) {
      t.ok(err instanceof Error)
      t.equal(err.message, response.error.message)
      t.deepEqual(err, extend(response.error, {status: 400}))
    })
  })

  t.end()
})
