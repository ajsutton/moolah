import sinon from 'sinon';
import format from 'date-fns/format';
import {assert, config as chaiConfig} from 'chai';
import {actions, ensureAllFieldsPresent, mutations} from '../../../../../src/store/transactions/transactionStore';
import {actions as accountActions} from '../../../../../src/store/accountsStore';
import {actions as stateActions} from '../../../../../src/store/store';
import transactionStoreLoader from 'inject-loader!../../../../../src/store/transactions/transactionStore';
import testAction from '../testAction';

chaiConfig.truncateThreshold = 0;

const expandFields = transactions => transactions.map(ensureAllFieldsPresent);
const addIdLookup = state => {
    state.transactionsById = {};
    state.transactions.forEach(transaction => state.transactionsById[transaction.id] = transaction);
    return state;
};

describe('transactionStore', function() {
    let client;
    let transactionStore;
    beforeEach(function() {
        client = {
            transactions: sinon.stub(),
            createTransaction: sinon.stub(),
            updateTransaction: sinon.stub(),
            deleteTransaction: sinon.stub(),
        };
        transactionStore = transactionStoreLoader({
            '../../api/client': client,
        }).default;
    });

    describe('Getters', function() {
        describe('selectedTransaction', function() {
            it('should find selected transaction', function() {
                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    addIdLookup({
                        transactions: [{id: 1}, {id: 2}, {id: 3}],
                    }),
                    {},
                    {selectedTransactionId: 2});
                assert.deepEqual(selectedTransaction, {id: 2});
            });

            it('should have undefined selected transaction when no transaction id is set', function() {

                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    addIdLookup({
                        transactions: [{id: 1}, {id: 2}, {id: 3}],
                    }),
                    {},
                    {selectedTransactionId: null});
                assert.isUndefined(selectedTransaction);
            });

            it('should have undefined selected transaction when transaction does not exist', function() {

                const selectedTransaction = transactionStore.getters.selectedTransaction(
                    addIdLookup({
                        transactions: [{id: 1}, {id: 3}],
                    }),
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
                    transactionsById: {},
                    priorBalance: 0,
                };
                transactionStore.mutations[mutations.setTransactions](state, {
                    transactions: [{id: 2, amount: 50}, {id: 1, amount: 25}],
                    priorBalance: 30,
                    singleAccount: true,
                });

                assert.deepEqual(state, {
                    transactions: expandFields([{id: 2, amount: 50, balance: 105}, {id: 1, amount: 25, balance: 55}]),
                    priorBalance: 30,
                    transactionsById: {
                        2: ensureAllFieldsPresent({id: 2, amount: 50, balance: 105}),
                        1: ensureAllFieldsPresent
                        ({id: 1, amount: 25, balance: 55}),
                    },
                    singleAccount: true,
                    loading: false,
                });
            });
        });

        describe('addTransaction', function() {
            it('should keep transactions sorted by date when inserting at start', function() {
                const state = addIdLookup({
                    transactions: expandFields([
                        {id: 2, amount: 10, date: '2017-07-02', balance: 60},
                        {id: 1, amount: 50, date: '2017-07-01', balance: 50}]), priorBalance: 0,
                });
                transactionStore.mutations[mutations.addTransaction](state, {id: 3, amount: 25, date: '2017-07-03'});
                assert.deepEqual(state, addIdLookup({
                    transactions: expandFields([
                        {id: 3, amount: 25, date: '2017-07-03', balance: 85},
                        {id: 2, amount: 10, date: '2017-07-02', balance: 60},
                        {id: 1, amount: 50, date: '2017-07-01', balance: 50},
                    ]),
                    priorBalance: 0,
                }));
            });

            it('should keep transactions sorted by date when inserting in middle', function() {
                const state = addIdLookup({transactions: expandFields([{id: 2, amount: 10, date: '2017-07-03', balance: 70}, {id: 1, amount: 50, date: '2017-07-01', balance: 50}]), priorBalance: 0});
                transactionStore.mutations[mutations.addTransaction](state, {id: 3, amount: 25, date: '2017-07-02'});
                assert.deepEqual(state, addIdLookup({
                    transactions: expandFields([
                        {id: 2, amount: 10, date: '2017-07-03', balance: 85},
                        {id: 3, amount: 25, date: '2017-07-02', balance: 75},
                        {id: 1, amount: 50, date: '2017-07-01', balance: 50},
                    ]),
                    priorBalance: 0,
                }));
            });

            it('should keep transactions sorted by date when inserting at end', function() {
                const state = addIdLookup({transactions: expandFields([{id: 2, amount: 10, date: '2017-07-03', balance: 70}, {id: 1, amount: 50, date: '2017-07-02', balance: 50}]), priorBalance: 0});
                transactionStore.mutations[mutations.addTransaction](state, {id: 3, amount: 25, date: '2017-07-01'});
                assert.deepEqual(state, addIdLookup({
                    transactions: expandFields([
                        {id: 2, amount: 10, date: '2017-07-03', balance: 85},
                        {id: 1, amount: 50, date: '2017-07-02', balance: 75},
                        {id: 3, amount: 25, date: '2017-07-01', balance: 25},
                    ]),
                    priorBalance: 0,
                }));
            });
        });

        describe('updateTransaction', function() {
            it('should update matching transaction details', function() {
                const state = addIdLookup({transactions: [{id: 1, payee: '', notes: '', amount: 30, balance: 100}]});
                transactionStore.mutations[mutations.updateTransaction](state, {
                    id: 1,
                    patch: {
                        payee: 'Georgina',
                        notes: 'My notes',
                    },
                });
                assert.deepEqual(state, addIdLookup({
                    transactions: [{id: 1, payee: 'Georgina', notes: 'My notes', amount: 30, balance: 100}],
                }));
            });

            it('should throw error when transaction is not found', function() {
                try {
                    transactionStore.mutations[mutations.updateTransaction](addIdLookup({transactions: []}), {id: 1});
                } catch (error) {
                    assert.equal(error.message, 'No transaction with ID 1');
                    return;
                }
                assert.fail('Should have thrown an error');
            });

            describe('Amount Changes', function() {
                it('should update balances when amount changes', function() {
                    const state = addIdLookup({transactions: [{id: 1, amount: 30, balance: 100}, {id: 2, amount: 20, balance: 70}], priorBalance: 50});
                    transactionStore.mutations[mutations.updateTransaction](state, {
                        id: 2,
                        patch: {
                            amount: -10,
                        },
                    });
                    assert.deepEqual(state, addIdLookup({
                        transactions: [{id: 1, amount: 30, balance: 70}, {id: 2, amount: -10, balance: 40}], priorBalance: 50,
                    }));
                });
            });

            describe('Date Changes', function() {
                it('should maintain sort order and balances when date is made more recent', function() {
                    const state = addIdLookup({transactions: [{id: 1, amount: 30, date: '2017-07-03', balance: 100}, {id: 2, amount: 20, date: '2017-07-02', balance: 70}], priorBalance: 50});
                    transactionStore.mutations[mutations.updateTransaction](state, {
                        id: 2,
                        patch: {
                            date: '2017-07-04',
                        },
                    });
                    assert.deepEqual(state, addIdLookup({
                        transactions: [{id: 2, amount: 20, date: '2017-07-04', balance: 100}, {id: 1, amount: 30, date: '2017-07-03', balance: 80}],
                        priorBalance: 50,
                    }));
                });

                it('should maintain sort order and balances when date is made less recent', function() {
                    const state = addIdLookup({transactions: [{id: 1, amount: 30, date: '2017-07-03', balance: 100}, {id: 2, amount: 20, date: '2017-07-02', balance: 70}], priorBalance: 50});
                    transactionStore.mutations[mutations.updateTransaction](state, {
                        id: 1,
                        patch: {
                            date: '2017-07-01',
                        },
                    });
                    assert.deepEqual(state, addIdLookup({
                        transactions: [{id: 2, amount: 20, date: '2017-07-02', balance: 100}, {id: 1, amount: 30, date: '2017-07-01', balance: 80}],
                        priorBalance: 50,
                    }));
                });
            });
        });

        describe('removeTransaction', function() {
            it('should remove the transaction', function() {
                const state = addIdLookup({transactions: [{id: 1}]});
                transactionStore.mutations[mutations.removeTransaction](state, {id: 1});
                assert.deepEqual(state, addIdLookup({transactions: []}));
            });

            it('should update balances after the removed transaction', function() {
                const state = addIdLookup({transactions: [{id: 3, amount: 10, balance: 50}, {id: 2, amount: 30, balance: 40}, {id: 1, amount: 10, balance: 10}]});
                transactionStore.mutations[mutations.removeTransaction](state, {id: 2});
                assert.deepEqual(state, addIdLookup({transactions: [{id: 3, amount: 10, balance: 20}, {id: 1, amount: 10, balance: 10}]}));
            });

            it('should update balances using prior balance when the first transaction is removed', function() {
                const state = addIdLookup({
                    transactions: expandFields([{id: 3, amount: 10, balance: 50, date: '2017-07-03'}, {id: 2, amount: 30, balance: 40, date: '2017-07-02'}, {
                        id: 1,
                        amount: 10,
                        balance: 10,
                        date: '2017-07-01',
                    }]),
                    priorBalance: 70,
                });
                transactionStore.mutations[mutations.removeTransaction](state, ensureAllFieldsPresent({id: 1, amount: 10, balance: 10, date: '2017-07-01'}));
                assert.deepEqual(state, addIdLookup({
                    transactions: expandFields([{id: 3, amount: 10, balance: 110, date: '2017-07-03'}, {id: 2, amount: 30, balance: 100, date: '2017-07-02'}]),
                    priorBalance: 70,
                }));
            });
        });
    });

    describe('Actions', function() {
        describe('loadTransactions', function() {
            it('should load transactions from server', async function() {
                const response = {
                    transactions: [{id: 3}, {id: 4}],
                    priorBalance: 12300,
                };
                client.transactions.withArgs({accountId: 'account-1'}).resolves(response);
                await testAction(
                    transactionStore,
                    actions.loadTransactions,
                    {
                        state: {transactions: [{id: 1}, {id: 2}], transactionsById: {}},
                        payload: {accountId: 'account-1'},
                    },
                    [
                        {type: mutations.setTransactions, payload: {transactions: [], priorBalance: 0, loading: true}},
                        {type: mutations.setTransactions, payload: response},
                    ],
                );
            });
        });

        describe('addTransaction', function() {
            let newTransaction;
            let initialTransactionProperties;
            let serverTransaction;
            beforeEach(function() {
                initialTransactionProperties = {
                    payee: '',
                    amount: 0,
                    date: format(new Date(), 'YYYY-MM-DD'),
                    notes: '',
                    accountId: 'account-1',
                    type: 'expense',
                    categoryId: null,
                };
                newTransaction = Object.assign({id: 'new-transaction'}, initialTransactionProperties);
                serverTransaction = Object.assign({}, initialTransactionProperties, {id: 'assigned-id'});
            });

            it('should add new transaction and notify server', async function() {
                client.createTransaction.withArgs(initialTransactionProperties).resolves(serverTransaction);
                const dispatch = sinon.spy();
                await testAction(
                    transactionStore,
                    actions.addTransaction,
                    {
                        state: {transactions: [], transactionsById: {}},
                        rootState: {selectedAccountId: 'account-1'},
                        dispatch,
                    },
                    [
                        {type: mutations.addTransaction, payload: newTransaction},
                        {type: mutations.updateTransaction, payload: {id: 'new-transaction', patch: serverTransaction}},
                    ],
                );
                sinon.assert.calledWith(client.createTransaction, initialTransactionProperties);
                sinon.assert.calledWith(dispatch, stateActions.selectTransaction, {id: serverTransaction.id, scheduled: false}, {root: true});
            });

            it('should remove transaction again if create fails', async function() {
                client.createTransaction.rejects('Invalid transaction');
                await testAction(
                    transactionStore,
                    actions.addTransaction,
                    {state: addIdLookup({transactions: [], priorBalance: 0}), rootState: {selectedAccountId: 'account-1'}, ignoreFailures: true},
                    [
                        {type: mutations.addTransaction, payload: Object.assign({}, newTransaction)},
                        {type: mutations.removeTransaction, payload: Object.assign(newTransaction, {balance: 0, recurPeriod: undefined, recurEvery: undefined})},
                    ],
                );
            });
        });

        describe('updateTransaction', function() {
            it('should modify transaction', async function() {
                const transaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13'};
                const patch = {payee: 'Payee2', notes: 'Notes'};
                const modifiedTransaction = Object.assign({}, transaction, patch);
                client.updateTransaction.withArgs(modifiedTransaction).resolves(modifiedTransaction);
                await testAction(
                    transactionStore,
                    actions.updateTransaction,
                    {state: addIdLookup({transactions: [transaction], priorBalance: 100}), payload: {id: 1, patch}},
                    [
                        {type: mutations.updateTransaction, payload: {id: 1, patch}},
                    ],
                );
                sinon.assert.calledWith(client.updateTransaction, modifiedTransaction);
            });

            it('should rollback transaction update if server rejects change', async function() {
                const transaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13'};
                const patch = {payee: 'Payee2', notes: 'Notes'};
                client.updateTransaction.rejects('Server says no');
                await testAction(
                    transactionStore,
                    actions.updateTransaction,
                    {state: addIdLookup({transactions: [transaction], priorBalance: 100}), payload: {id: 1, patch}, ignoreFailures: true},
                    [
                        {type: mutations.updateTransaction, payload: {id: 1, patch}},
                        {type: mutations.updateTransaction, payload: {id: 1, patch: transaction}},
                    ],
                );
            });

            it('should not update balance of toAccount when updating a scheduled transfer', async function() {
                const transaction = {id: 1, amount: -10, payee: 'Payee1', type: 'expense', balance: 100, date: '2016-07-13', recurPeriod: 'ONCE'};
                const patch = {type: 'transfer', toAccountId: 'account-2'};
                const modifiedTransaction = Object.assign({}, transaction, patch);
                client.updateTransaction.withArgs(modifiedTransaction).resolves(modifiedTransaction);
                const dispatch = sinon.spy();
                await testAction(
                    transactionStore,
                    actions.updateTransaction,
                    {state: addIdLookup({transactions: [transaction], priorBalance: 100}), dispatch, payload: {id: 1, patch}},
                    [
                        {type: mutations.updateTransaction, payload: {id: 1, patch}},
                    ],
                );
                sinon.assert.callCount(dispatch, 0);
            });

            [
                {
                    name: 'becomes a transfer',
                    transaction: {id: 1, amount: -10, payee: 'Payee1', type: 'expense', balance: 100, date: '2016-07-13'},
                    patch: {type: 'transfer', toAccountId: 'account-2'},
                    adjustBalance: [{accountId: 'account-2', amount: 10}],
                },
                {
                    name: 'stops being a transfer',
                    transaction: {id: 1, amount: -10, payee: 'Payee1', type: 'transfer', toAccountId: 'account-2', balance: 100, date: '2016-07-13'},
                    patch: {type: 'expense', toAccountId: null},
                    adjustBalance: [{accountId: 'account-2', amount: -10}],
                },
                {
                    name: 'stops being a transfer and changes amount',
                    transaction: {id: 1, accountId: 'account-1', amount: -10, payee: 'Payee1', type: 'transfer', toAccountId: 'account-2', balance: 100, date: '2016-07-13'},
                    patch: {type: 'income', toAccountId: null, amount: 20},
                    adjustBalance: [{accountId: 'account-1', amount: 30}, {accountId: 'account-2', amount: -10}],
                },
                {
                    name: 'changes amount',
                    transaction: {id: 1, accountId: 'account-1', amount: -10, payee: 'Payee1', type: 'transfer', toAccountId: 'account-2', balance: 100, date: '2016-07-13'},
                    patch: {amount: -30},
                    adjustBalance: [{accountId: 'account-1', amount: -20}, {accountId: 'account-2', amount: 20}],
                },
                {
                    name: 'changes amount when not a transfer',
                    transaction: {id: 1, accountId: 'account-1', amount: -10, payee: 'Payee1', type: 'expense', balance: 100, date: '2016-07-13'},
                    patch: {amount: -30},
                    adjustBalance: [{accountId: 'account-1', amount: -20}],
                },
                {
                    name: 'changes destination account',
                    transaction: {id: 1, accountId: 'account-1', amount: -10, payee: 'Payee1', type: 'transfer', toAccountId: 'account-2', balance: 100, date: '2016-07-13'},
                    patch: {toAccountId: 'account-3'},
                    adjustBalance: [{accountId: 'account-2', amount: -10}, {accountId: 'account-3', amount: 10}],
                },
                {
                    name: 'changes destination account and amount',
                    transaction: {id: 1, accountId: 'account-1', amount: -10, payee: 'Payee1', type: 'transfer', toAccountId: 'account-2', balance: 100, date: '2016-07-13'},
                    patch: {toAccountId: 'account-3', amount: -30},
                    adjustBalance: [{accountId: 'account-1', amount: -20}, {accountId: 'account-2', amount: -10}, {accountId: 'account-3', amount: 30}],
                },
            ].forEach(scenario => {
                it(`should update balance of other account when a transaction ${scenario.name}`, async function() {
                    const transaction = ensureAllFieldsPresent(scenario.transaction);
                    const patch = scenario.patch;
                    const modifiedTransaction = Object.assign({}, transaction, patch);
                    client.updateTransaction.withArgs(modifiedTransaction).resolves(modifiedTransaction);
                    const dispatch = sinon.spy();
                    await testAction(
                        transactionStore,
                        actions.updateTransaction,
                        {state: addIdLookup({transactions: [transaction], priorBalance: 100}), dispatch, payload: {id: 1, patch}},
                        [
                            {type: mutations.updateTransaction, payload: {id: 1, patch}},
                        ],
                    );
                    scenario.adjustBalance.forEach(param => sinon.assert.calledWith(dispatch, 'accounts/' + accountActions.adjustBalance, param, {root: true}));
                    sinon.assert.callCount(dispatch, scenario.adjustBalance.length);
                });
            });
        });

        describe('deleteTransaction', function() {
            it('should remove the transaction', async function() {
                const transaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13'};
                client.deleteTransaction.withArgs(transaction).resolves();
                await testAction(
                    transactionStore,
                    actions.deleteTransaction,
                    {state: addIdLookup({transactions: [transaction], priorBalance: 100}), payload: transaction},
                    [
                        {type: mutations.removeTransaction, payload: transaction},
                    ],
                );
                sinon.assert.calledWith(client.deleteTransaction, transaction);
            });

            it('should re-add transaction if server rejects deletion', async function() {
                const transaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13'};
                client.deleteTransaction.withArgs(transaction).rejects();
                await testAction(
                    transactionStore,
                    actions.deleteTransaction,
                    {
                        state: addIdLookup({transactions: [transaction], priorBalance: 100}),
                        payload: transaction,
                        ignoreFailures: true,
                    },
                    [
                        {type: mutations.removeTransaction, payload: transaction},
                        {type: mutations.addTransaction, payload: transaction},
                    ],
                );
            });
        });

        describe('payTransaction', function() {
            it('should remove scheduled transaction if it is once off', async function() {
                const scheduledTransaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13', recurPeriod: 'ONCE', accountId: 'account1'};
                client.deleteTransaction.withArgs(scheduledTransaction).resolves();
                await testAction(
                    transactionStore,
                    actions.payTransaction,
                    {
                        state: addIdLookup({transactions: [scheduledTransaction], priorBalance: 100}),
                        payload: scheduledTransaction,
                        dispatch: sinon.spy(),
                    },
                    [
                        {type: mutations.removeTransaction, payload: scheduledTransaction},
                    ],
                );

                sinon.assert.calledWith(client.deleteTransaction, scheduledTransaction);
                sinon.assert.calledWith(client.createTransaction, {amount: 10, payee: 'Payee1', date: '2016-07-13', accountId: 'account1'});
            });

            [
                {description: 'repeating daily', scheduledDate: '2016-07-13', recurPeriod: 'DAY', recurEvery: 5, nextScheduledDate: '2016-07-18'},
                {description: 'repeating weekly', scheduledDate: '2017-07-13', recurPeriod: 'WEEK', recurEvery: 6, nextScheduledDate: '2017-08-24'},
                {description: 'repeating monthly', scheduledDate: '2016-10-13', recurPeriod: 'MONTH', recurEvery: 9, nextScheduledDate: '2017-07-13'},
                {description: 'repeating monthly', scheduledDate: '2016-10-13', recurPeriod: 'YEAR', recurEvery: 4, nextScheduledDate: '2020-10-13'},
            ].forEach(params => {
                it(`should move date of scheduled transaction to next repeat when ${params.description}`, async function() {
                    const scheduledTransaction = {
                        id: 1,
                        amount: 10,
                        payee: 'Payee1',
                        balance: 10,
                        date: params.scheduledDate,
                        recurPeriod: params.recurPeriod,
                        recurEvery: params.recurEvery,
                        accountId: 'account1',
                    };
                    const modifiedTransaction = Object.assign({}, scheduledTransaction, {date: params.nextScheduledDate});
                    client.updateTransaction.withArgs(scheduledTransaction).resolves(modifiedTransaction);
                    client.createTransaction.resolves();
                    await testAction(
                        transactionStore,
                        actions.payTransaction,
                        {
                            state: addIdLookup({transactions: [scheduledTransaction], priorBalance: 0}),
                            payload: scheduledTransaction,
                            dispatch: sinon.spy(),
                        },
                        [
                            {type: mutations.updateTransaction, payload: {id: scheduledTransaction.id, patch: {date: params.nextScheduledDate}}},
                        ],
                    );

                    sinon.assert.calledWith(client.updateTransaction, modifiedTransaction);
                    sinon.assert.calledWith(client.createTransaction, {amount: 10, payee: 'Payee1', date: params.scheduledDate, accountId: 'account1'});
                });
            });

            it('should update balance of account', async function() {
                const scheduledTransaction = {id: 1, amount: 10, payee: 'Payee1', balance: 100, date: '2016-07-13', recurPeriod: 'ONCE', accountId: 'account1'};
                client.deleteTransaction.withArgs(scheduledTransaction).resolves();
                const dispatch = sinon.spy();
                await testAction(
                    transactionStore,
                    actions.payTransaction,
                    {
                        state: addIdLookup({transactions: [scheduledTransaction], priorBalance: 100}),
                        payload: scheduledTransaction,
                        dispatch
                    },
                    [
                        {type: mutations.removeTransaction, payload: scheduledTransaction},
                    ],
                );

                sinon.assert.calledWith(dispatch, 'accounts/' + accountActions.adjustBalance, {accountId: 'account1', amount: scheduledTransaction.amount}, {root: true})
            });

            it('should update balance of both accounts when transaction is a transfer', async function() {
                const scheduledTransaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                    recurPeriod: 'ONCE',
                    accountId: 'account1',
                    type: 'transfer',
                    toAccountId: 'account2',
                };
                client.deleteTransaction.withArgs(scheduledTransaction).resolves();
                const dispatch = sinon.spy();
                await testAction(
                    transactionStore,
                    actions.payTransaction,
                    {
                        state: addIdLookup({transactions: [scheduledTransaction], priorBalance: 100}),
                        payload: scheduledTransaction,
                        dispatch
                    },
                    [
                        {type: mutations.removeTransaction, payload: scheduledTransaction},
                    ],
                );

                sinon.assert.calledWith(dispatch, 'accounts/' + accountActions.adjustBalance, {accountId: 'account1', amount: scheduledTransaction.amount}, {root: true})
                sinon.assert.calledWith(dispatch, 'accounts/' + accountActions.adjustBalance, {accountId: 'account2', amount: -scheduledTransaction.amount}, {root: true})
            });
        });
    });
});
