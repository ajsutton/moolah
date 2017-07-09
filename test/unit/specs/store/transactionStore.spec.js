import sinon from 'sinon';
import moment from 'moment';
import {assert} from 'chai';
import {actions, mutations} from '../../../../src/store/transactionStore';
import transactionStoreLoader from 'inject-loader!../../../../src/store/transactionStore';
import testAction from './testAction';

describe('transactionStore', function() {
    let client;
    let transactionStore;
    beforeEach(function() {
        client = {
            transactions: sinon.stub(),
            createTransaction: sinon.stub(),
        };
        transactionStore = transactionStoreLoader({
            '../api/client': client,
        }).default;
    });

    describe('Getters', function() {
        describe('selectedTransaction', function() {
            it('should find selected transaction', function() {
                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    {
                        transactions: [{id: 1}, {id: 2}, {id: 3}],
                    },
                    {},
                    {selectedTransactionId: 2});
                assert.deepEqual(selectedTransaction, {id: 2});
            });

            it('should have undefined selected transaction when no transaction id is set', function() {

                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    {
                        transactions: [{id: 1}, {id: 2}, {id: 3}],
                    },
                    {},
                    {selectedTransactionId: null});
                assert.isUndefined(selectedTransaction);
            });

            it('should have undefined selected transaction when transaction does not exist', function() {

                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    {
                        transactions: [{id: 1}, {id: 3}],
                    },
                    {},
                    {selectedTransactionId: 2});
                assert.isUndefined(selectedTransaction);
            });
        });
    });

    describe('Mutations', function() {
        describe('setTransactions', function() {
            it('should calculate balances', function() {
                const state = {
                    transactions: [],
                    priorBalance: 0
                };
                transactionStore.mutations[mutations.setTransactions](state, {
                    transactions: [{id: 2, amount: 50}, {id: 1, amount: 25}],
                    priorBalance: 30,
                });

                assert.deepEqual(state, {
                    transactions: [{id: 2, amount: 50, balance: 105}, {id: 1, amount: 25, balance: 55}],
                    priorBalance: 30,
                });
            });
        });

        describe('addTransaction', function() {
            it('should add transaction at start of list', function() {
                const state = {transactions: [{id: 2, balance: 20}, {id: 1, balance: 10}]};
                transactionStore.mutations[mutations.addTransaction](state, {id: 3, amount: 50, payee: 'Georgina'});
                assert.deepEqual(state, {
                    transactions: [
                        {id: 3, amount: 50, payee: 'Georgina', balance: 70},
                        {id: 2, balance: 20},
                        {id: 1, balance: 10},
                    ],
                });
            });

            it('should sort transactions by date');
        });

        describe('updateTransaction', function() {
            it('should update matching transaction details', function() {
                const state = {transactions: [{id: 1, payee: '', notes: '', amount: 30, balance: 100}]};
                transactionStore.mutations[mutations.updateTransaction](state, {
                    id: 1,
                    patch: {
                        payee: 'Georgina',
                        notes: 'My notes',
                    },
                });
                assert.deepEqual(state, {
                    transactions: [{id: 1, payee: 'Georgina', notes: 'My notes', amount: 30, balance: 100}],
                });
            });

            it('should throw error when transaction is not found', function() {
                try {
                    transactionStore.mutations[mutations.updateTransaction]({transactions: []}, {id: 1});
                } catch (error) {
                    assert.equal(error.message, 'No transaction with ID 1');
                    return;
                }
                assert.fail('Should have thrown an error');
            });

            it('should update balances when amount changes');
            it('should maintain sort order and balances when date is made more recent');
            it('should maintain sort order and balances when date is made less recent');
        });

        describe('removeTransaction', function() {
            it('should remove the transaction', function() {
                const state = {transactions: [{id: 1}]};
                transactionStore.mutations[mutations.removeTransaction](state, {id: 1});
                assert.deepEqual(state, {transactions:[]});
            });

            it('should update balances after the removed transaction', function() {
                const state = {transactions: [{id: 3, amount: 10, balance: 50}, {id: 2, amount: 30, balance: 40}, {id: 1, amount: 10, balance: 10}]};
                transactionStore.mutations[mutations.removeTransaction](state, {id: 2});
                assert.deepEqual(state, {transactions:[{id: 3, amount: 10, balance: 20}, {id: 1, amount: 10, balance: 10}]});
            });

            it('should update balances using prior balance when the first transaction is removed', function() {
                const state = {
                    transactions: [{id: 3, amount: 10, balance: 50}, {id: 2, amount: 30, balance: 40}, {id: 1, amount: 10, balance: 10}],
                    priorBalance: 70
                };
                transactionStore.mutations[mutations.removeTransaction](state, {id: 1});
                assert.deepEqual(state, {
                    transactions:[{id: 3, amount: 10, balance: 110}, {id: 2, amount: 30, balance: 100}],
                    priorBalance: 70,
                });
            });
        });
    });

    describe('Actions', function() {
        describe('loadTransactions', function() {
            it('should set transactions to empty list when there is no selected account ID', async function() {
                await testAction(
                    transactionStore.actions[actions.loadTransactions],
                    {
                        state: {transactions: [{id: 1}, {id: 2}]},
                        rootState: {selectedAccountId: null},
                    },
                    [
                        {type: mutations.setTransactions, payload: []},
                    ],
                );
            });

            it('should load transactions from server', async function() {
                const response = {
                    transactions: [{id: 3}, {id: 4}],
                    priorBalance: 12300,
                };
                client.transactions.withArgs('account-1').resolves(response);
                await testAction(
                    transactionStore.actions[actions.loadTransactions],
                    {
                        state: {transactions: [{id: 1}, {id: 2}]},
                        rootState: {selectedAccountId: 'account-1'},
                    },
                    [
                        {type: mutations.setTransactions, payload: response},
                    ],
                );
            });
        });

        describe('addTransaction', function() {
            let newTransaction;
            let serverTransaction;
            beforeEach(function() {
                newTransaction = {
                    id: 'new-transaction',
                    payee: null,
                    amount: 0,
                    date: moment().format('YYYY-MM-dd'),
                    notes: '',
                    accountId: 'account-1',
                    type: 'expense',
                };
                serverTransaction = Object.assign({}, newTransaction, {id: 'assigned-id'});
            });

            it('should add new transaction and notify server', async function() {
                client.createTransaction.withArgs(newTransaction).resolves(serverTransaction);
                await testAction(
                    transactionStore.actions[actions.addTransaction],
                    {state: {}, rootState: {selectedAccountId: 'account-1'}},
                    [
                        {type: mutations.addTransaction, payload: newTransaction},
                        {type: mutations.updateTransaction, payload: {id: 'new-transaction', patch: serverTransaction}},
                    ],
                );
                sinon.assert.calledWith(client.createTransaction, newTransaction);
            });

            it('should remove transaction again if create fails', async function() {
                client.createTransaction.withArgs(newTransaction).rejects('Invalid transaction');
                await testAction(
                    transactionStore.actions[actions.addTransaction],
                    {state: {}, rootState: {selectedAccountId: 'account-1'}, ignoreFailures: true},
                    [
                        {type: mutations.addTransaction, payload: newTransaction},
                        {type: mutations.removeTransaction, payload: newTransaction},
                    ],
                );
            });
        });
    });
});
