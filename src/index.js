'use strict';

import deep from 'deep-property';
import extend from 'xtend/mutable';

const asyncMethods = [
  'card.createToken',
  'bankAccount.createToken',
  'bitcoinReceiver.createReceiver',
  'bitcoinReceiver.pollReceiver'
];

const helperMethods = [
  'setPublishableKey',
  'card.validateCardNumber',
  'card.validateExpiry',
  'card.validateCVC',
  'card.cardType',
  'bankAccount.validateRoutingNumber',
  'bankAccount.validateAccountNumber',
  'bitcoinReceiver.cancelReceiverPoll'
];

export default function (Stripe, Promise) {
  if (!Promise) throw new Error('Promise constructor must be provided');
  const stripe = {};
  asyncMethods.forEach((method) => {
    const [context] = method.split('.');
    const fn = deep.get(Stripe, method);
    deep.set(stripe, method, promisify(Promise, fn, context, stripeResponseHandler));
  });
  helperMethods.forEach((method) => {
    deep.set(stripe, method, deep.get(Stripe, method));
  });
  return stripe;
}

function promisify (Promise, fn, context, resolver) {
  return function promisified (...args) {
    return new Promise((resolve, reject) => {
      fn.apply(context, args.concat(function () {
        resolver.apply({resolve, reject}, arguments);
      }));      
    });
  };
}

function stripeResponseHandler (status, response) {
  if (response.error) {
    this.reject(extend(new Error(), response.error));
  }
  else {
    this.resolve(response);
  }
}
