# stripe-as-promised [![Build Status](https://travis-ci.org/bendrucker/stripe-as-promised.svg?branch=master)](https://travis-ci.org/bendrucker/stripe-as-promised)

Wrap [Stripe.js](https://stripe.com/docs/stripe.js)'s asynchronous methods to return promises instead of calling callbacks.

## Installing

```sh
# npm
$ npm install stripe-as-promised
# bower
$ bower install stripe-as-promsied
```

## API

##### `stripeAsPromised(Stripe, Promise)` -> `promisifed`

`stripeAsPromised` accepts two arguments: `Stripe` (typically exposed as a global `Stripe`) and `Promise`, a promise constructor. Both arguments are required, even if a native promise is available. A `promisified` Stripe object is returned. It exposes the same public API as Stripe.js, but promisifies the following methods:

* [`card.createToken`](https://stripe.com/docs/stripe.js#card-createToken)
* [`bankAccount.createToken`](https://stripe.com/docs/stripe.js#bank-account-createToken)
* [`bitcoinReceiver.createReceiver`](https://stripe.com/docs/stripe.js#bitcoinreceiver-createreceiver)
* [`bitcoinReceiver.pollReceiver`](https://stripe.com/docs/stripe.js#bitcoinreceiver-pollreceiver)
* `bitcoinReceiver.getReceiver` (undocumented)


## Usage

### Example

Below is an abbreviated version of Stripe's [documented example for creating a token](https://stripe.com/docs/stripe.js#collecting-card-details):

```js
// card === {number: '42...', ...}
Stripe.card.createToken(card, stripeResponseHandler);

function stripeResponseHandler(status, token) {
  if (token.error) {
    console.error('Tokenization failed');
  } else {
    console.log('Created token', token.id);
  }
}
```

The same logic with stripe-as-promised would be written as:

```js
var stripe = stripeAsPromised(Stripe, Promise);

stripe.card.createToken(card)
  .then(function (token) {
    console.log('Created token', token.id);
  })
  .catch(function (err) {
    console.error(err);
  });
```

### Bitcoin

For handling bitcoin transactions, you'll probably want to avoid using the `pollReceiver` method as-is. `cancelReceiverPoll` does not notify the callback passed to `pollReceiver` of the cancellation, so the following code could result in a promise that never resolves:

```js
stripe.bitcoinReceiver.createReceiver(payment)
  .then(function (receiver) {
    return stripe.bitcoinReceiver.pollReceiver(receiver.id);
  })
  .then(function (receiver) {
    console.log('Payment received!');
  })
  .catch(function (err) {
    console.error('Payment error', err);
  });
```

If the receiver is never filled, neither statement is printed. In your application, you'll probably want to implement your own polling implementation that treats cancellations as errors that can be caught and handled downstream.
