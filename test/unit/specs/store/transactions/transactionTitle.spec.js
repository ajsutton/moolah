import {assert} from 'chai';
import {transactionTitle} from '../../../../../src/components/transactions/transactionTitle';

describe('Transaction Title', function() {
    const getAccountName = id => 'Account ' + id;

    it('should label opening balance transactions', function() {
        assert.equal(transactionTitle({type: 'openingBalance'}, getAccountName), 'Opening balance');
    });

    it('should show payee for simple transaction', function() {
        assert.equal(transactionTitle({payee: 'Bob'}, getAccountName), 'Bob');
    });

    it('should be non-breaking space for simple transactions with no payee', function() {
        assert.equal(transactionTitle({}, getAccountName), '\xa0');
    });

    it('should label transfers that have a payee', function() {
        assert.equal(transactionTitle({type: 'transfer', payee: 'Bob', amount: -20, toAccountId: 2}, getAccountName), 'Bob (Transfer to Account 2)');
    });

    it('should label transfers that have no payee', function() {
        assert.equal(transactionTitle({type: 'transfer', amount: -20, toAccountId: 2}, getAccountName), 'Transfer to Account 2');
    });

    it('should label transfers into account', function() {
        assert.equal(transactionTitle({type: 'transfer', amount: 20, toAccountId: 2}, getAccountName), 'Transfer from Account 2');
    });

    it('should label scheduled transfers into account', function() {
        assert.equal(transactionTitle({type: 'transfer', amount: 20, toAccountId: 2, accountId: 1, recurPeriod: 'ONCE'}, getAccountName), 'Transfer from Account 2 to Account 1');
    });

    it('should label scheduled transfers out of account', function() {
        assert.equal(transactionTitle({type: 'transfer', amount: -20, toAccountId: 2, accountId: 1, recurPeriod: 'ONCE'}, getAccountName), 'Transfer from Account 1 to Account 2');
    });
});
