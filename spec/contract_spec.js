var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Contract = require('../src/contract');
var contract;
var web3Contract;
var sandbox;

describe('Contract', function() {
    describe('watchEvent', function() {
        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            web3Contract = {
                SomeEvent: function() {
                    return {
                        watch: function(callback) {
                            callback(null, {args: 'abc'});
                        }
                    };
                }
            };
            contract = new Contract(web3Contract);
        });
        afterEach(function() {
            sandbox.restore();
        });

        it('defers to the event object', function() {
            var watchSpy = sinon.spy();
            web3Contract.SomeEvent = function() {
                return {
                    watch: watchSpy
                };
            };
            contract.watchEvent('SomeEvent', () => {});
            expect(watchSpy).to.have.been.called;
        });

        it('calls the callback when an event occurs', function() {
            contract.watchEvent('SomeEvent', function(error, args) {
                expect(args).to.not.eql('undefined');
            });
        });

        it('calls the callback with an error when an error occurs', function() {
            web3Contract.SomeEvent = function() {
                return {
                    watch: function(callback) {
                        callback('error');
                    }
                };
            };
            contract.watchEvent('SomeEvent', function(error, args) {
                expect(error).to.not.eql(null);
            });
        });
    });
});
