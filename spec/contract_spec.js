var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var expect = chai.expect;

var Contract = require('../src/contract');

describe('Contract', function() {
    describe('watchEvent', function() {

        var eventObject;
        var web3Contract;
        var contract;

        beforeEach(function() {
            callbackArgs = {args: 'abc'};
            eventObject = {
                watch: function(callback) {
                    callback(null, callbackArgs);
                }
            };
            web3Contract = {
                SomeEvent: function() {
                    return eventObject;
                }
            };
            contract = new Contract(web3Contract);
        });

        it('defers to the event object', function() {
            chai.spy.on(eventObject, 'watch');
            contract.watchEvent('SomeEvent', () => {});
            expect(eventObject.watch).to.have.been.called();
        });

        it('calls the callback when an event occurs', function() {
            contract.watchEvent('SomeEvent', function(error, args) {
                expect(args).to.eql(callbackArgs.args);
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
                expect(error).to.eql('error');
            });
        });
    });
});
