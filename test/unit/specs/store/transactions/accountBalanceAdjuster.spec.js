import accountBalanceAdjuster from '../../../../../src/store/transactions/accountBalanceAdjuster';
import {actions as accountActions} from '../../../../../src/store/accounts/accountsStore';
import sinon from 'sinon';

describe('Account Balance Adjuster', function() {

    let dispatch;
    beforeEach(function() {
        dispatch = sinon.spy();
    });

    describe('Basic Transactions', function() {
        it('should adjust account balance when amount changes', function() {
            assertAdjustments({amount: 10}, {amount: 20}, {accountId: 'account1', amount: 10});
        });

        it('should adjust account balance when transaction added', function() {
            assertAdjustments(null, {amount: 20}, {accountId: 'account1', amount: 20});
        });

        it('should adjust account balance when transaction removed', function() {
            assertAdjustments({amount: 20}, null, {accountId: 'account1', amount: -20});
        });

        it('should adjust account balance when transaction changes account', function() {
            assertAdjustments({accountId: 'account1', amount: 20}, {accountId: 'account2', amount: 20},
                {accountId: 'account1', amount: -20},
                {accountId: 'account2', amount: 20});
        });
    });

    describe('Transfers', function() {
        it('should adjust both accounts when amount changes', function() {
            assertAdjustments({amount: 10, toAccountId: 'account2'}, {amount: 20, toAccountId: 'account2'},
                {accountId: 'account1', amount: 10},
                {accountId: 'account2', amount: -10});
        });

        it('should adjust both accounts when transfer added', function() {
            assertAdjustments(null, {amount: 20, toAccountId: 'account2'},
                {accountId: 'account1', amount: 20},
                {accountId: 'account2', amount: -20});
        });

        it('should adjust both accounts when transfer removed', function() {
            assertAdjustments({amount: 20, toAccountId: 'account2'}, null,
                {accountId: 'account1', amount: -20},
                {accountId: 'account2', amount: 20});
        });

        it('should update toAccounts when toAccountId changes', function() {
            assertAdjustments({amount: 20, toAccountId: 'account2'}, {amount: 20, toAccountId: 'account3'},
                {accountId: 'account2', amount: 20},
                {accountId: 'account3', amount: -20});
        });
    });

    it('should ignore scheduled transactions', function() {
        assertAdjustments({amount: 10, toAccountId: 'account2', recurPeriod: 'ONCE'}, {amount: 20, toAccountId: 'account2', recurPeriod: 'ONCE'});
    });

    function assertAdjustments(originalTransaction, modifiedTransaction, ...adjustments) {
        accountBalanceAdjuster(dispatch, makeTransaction(originalTransaction), makeTransaction(modifiedTransaction));
        adjustments.forEach(adjustment => sinon.assert.calledWith(dispatch, 'accounts/' + accountActions.adjustBalance, adjustment, {root: true}));
        sinon.assert.callCount(dispatch, adjustments.length);
    }

    function makeTransaction(properties) {
        return properties !== null ? Object.assign({accountId: 'account1', amount: 0, toAccountId: null}, properties) : properties;
    }
});
