'use strict';

import 'es5-shim';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import Promise from 'bluebird';
import stripeAsPromised from '../';

chai.use(chaiAsPromised).use(sinonChai);

const expect = chai.expect;

let stripe;
function promisify () {
  stripe = stripeAsPromised(Stripe, Promise);
}

describe('stripe-as-promised', () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('passes through utility methods', () => {
    promisify();
    expect(stripe.card.validateCardNumber).to.equal(Stripe.card.validateCardNumber);
  });

  it('promisifies card.createToken', () => {
    const response = {
      id: 'theToken'
    };
    sandbox.stub(Stripe.card, 'createToken').yieldsAsync(200, response);
    promisify();
    expect(stripe.card.createToken).to.not.equal(Stripe.card.createToken);
    const [data, params] = [{}, {}];
    return stripe.card.createToken(data, params)
      .then((res) => {
        expect(res).to.equal(response);
        expect(Stripe.card.createToken).to.have.been.calledWith(data, params);
      });
  });

  it('handles token errors as rejections', () => {
    const response = {
      error: {
        message: 'Routing number must have 9 digits',
        param: 'bank_account',
        type: 'invalid_request_error'
      }
    };
    sandbox.stub(Stripe.bankAccount, 'createToken').yieldsAsync(400, response);
    promisify();
    const [data, params] = [{}, {}];
    return expect(stripe.bankAccount.createToken(data, params)).to.be.rejectedWith(response.error.message);
  });

});
