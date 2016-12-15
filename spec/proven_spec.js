var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Proven = require('../src/proven');

describe('Proven', function() {

    var mockContract;
    var proven;

    beforeEach(function() {
        mockContract = {watchEvent: (eventName, callback) => {}};
        proven = new Proven(mockContract);
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('hooks into contract event', function() {
        mockContract.watchEvent = sinon.spy();
        var callback = () => {};
        proven.onDepositionPublished(callback);
        expect(mockContract.watchEvent).to.have.been.calledWith('DepositionPublished', callback);
    });

});
