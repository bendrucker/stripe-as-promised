'use strict';

import clone from 'clone';
import extend from 'xtend/mutable';

const methods = [
  'card.createToken',
  'bankAccount.createToken',
  'bitcoinReceiver.createReceiver',
  'bitcoinReceiver.pollReceiver'
];

export default function (Stripe, Promise) {
  if (!Promise) throw new Error('Promise constructor must be provided');
  return methods.reduce((Stripe, method) => {
    const [context, name] = method.split('.');
    const fn = Stripe[context][name];
    Stripe[context][name] = promisify(Promise, fn, context, stripeResponseHandler);
    return Stripe;
  }, clone(Stripe));
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
