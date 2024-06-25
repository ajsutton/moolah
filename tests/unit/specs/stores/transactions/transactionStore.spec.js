import sinon from 'sinon';
import format from 'date-fns/format';
import { assert, config as chaiConfig } from 'chai';
import transactionStoreLoader from 'inject-loader!babel-loader!../../../../../src/stores/transactions/transactionStore';
import { createPinia, setActivePinia } from 'pinia';

chaiConfig.truncateThreshold = 0;

const addIdLookup = state => {
    state.transactionsById = {};
    state.transactions.forEach(
        transaction => (state.transactionsById[transaction.id] = transaction)
    );
    return state;
};

describe('transactionStore', function () {
    let client;
    let transactionsStore;
    let accountsStore;
    let accountActions;
    let rootStore;
    let stateActions;
    let actions, ensureAllFieldsPresent, loadingStates, mutations;
    const expandFields = transactions =>
        transactions.map(ensureAllFieldsPresent);
    beforeEach(async function () {
        setActivePinia(createPinia());
        client = {
            transactions: sinon.stub(),
            createTransaction: sinon.stub(),
            updateTransaction: sinon.stub(),
            deleteTransaction: sinon.stub(),
        };
        const transactionsModule = transactionStoreLoader({
            '../../api/client': client,
        });
        transactionsStore = transactionsModule.useTransactionsStore();
        actions = transactionsModule.actions;
        ensureAllFieldsPresent = transactionsModule.ensureAllFieldsPresent;
        loadingStates = transactionsModule.loadingStates;
        mutations = transactionsModule.mutations;
        const rootDefs = await require('../../../../../src/stores/root');
        stateActions = rootDefs.actions;
        rootStore = rootDefs.useRootStore();
        const accountDefs =
            await require('../../../../../src/stores/accountsStore');
        accountsStore = accountDefs.useAccountsStore();
        accountActions = accountDefs.actions;
    });

    describe('Getters', function () {
        describe('selectedTransaction', function () {
            it('should find selected transaction', function () {
                setupState({ transactions: [{ id: 1 }, { id: 2 }, { id: 3 }] });
                rootStore.selectedTransactionId = 2;
                const selectedTransaction =
                    transactionsStore.selectedTransaction;
                assert.deepEqual(selectedTransaction, { id: 2 });
            });

            it('should have undefined selected transaction when no transaction id is set', function () {
                setupState({ transactions: [{ id: 1 }, { id: 2 }, { id: 3 }] });
                const selectedTransaction =
                    transactionsStore.selectedTransaction;
                assert.isUndefined(selectedTransaction);
            });

            it('should have undefined selected transaction when transaction does not exist', function () {
                setupState({ transactions: [{ id: 1 }, { id: 3 }] });
                rootStore.selectedTransactionId = 2;
                const selectedTransaction =
                    transactionsStore.selectedTransaction;
                assert.isUndefined(selectedTransaction);
            });
        });
    });

    describe('Mutations', function () {
        describe('setTransactions', function () {
            it('should calculate balances', function () {
                transactionsStore[mutations.setTransactions]({
                    transactions: [
                        { id: 2, amount: 50 },
                        { id: 1, amount: 25 },
                    ],
                    priorBalance: 30,
                    hasMore: true,
                    totalNumberOfTransactions: 45,
                    searchOptions: { account: 'account1', page: 13 },
                });

                assertCurrentState({
                    transactions: expandFields([
                        { id: 2, amount: 50, balance: 105 },
                        { id: 1, amount: 25, balance: 55 },
                    ]),
                    priorBalance: 30,
                    transactionsById: {
                        2: ensureAllFieldsPresent({
                            id: 2,
                            amount: 50,
                            balance: 105,
                        }),
                        1: ensureAllFieldsPresent({
                            id: 1,
                            amount: 25,
                            balance: 55,
                        }),
                    },
                    searchOptions: { account: 'account1', page: 13 },
                    loadingState: loadingStates.IDLE,
                    hasMore: true,
                    totalNumberOfTransactions: 45,
                });
            });
        });

        describe('addTransaction', function () {
            it('should keep transactions sorted by date when inserting at start', function () {
                setupState({
                    transactions: expandFields([
                        { id: 2, amount: 10, date: '2017-07-02', balance: 60 },
                        { id: 1, amount: 50, date: '2017-07-01', balance: 50 },
                    ]),
                    priorBalance: 0,
                });
                transactionsStore[mutations.addTransaction]({
                    id: 3,
                    amount: 25,
                    date: '2017-07-03',
                });
                assertCurrentState(
                    addIdLookup({
                        transactions: expandFields([
                            {
                                id: 3,
                                amount: 25,
                                date: '2017-07-03',
                                balance: 85,
                            },
                            {
                                id: 2,
                                amount: 10,
                                date: '2017-07-02',
                                balance: 60,
                            },
                            {
                                id: 1,
                                amount: 50,
                                date: '2017-07-01',
                                balance: 50,
                            },
                        ]),
                        priorBalance: 0,
                    })
                );
            });

            it('should keep transactions sorted by date when inserting in middle', function () {
                setupState({
                    transactions: expandFields([
                        { id: 2, amount: 10, date: '2017-07-03', balance: 70 },
                        { id: 1, amount: 50, date: '2017-07-01', balance: 50 },
                    ]),
                    priorBalance: 0,
                });
                transactionsStore[mutations.addTransaction]({
                    id: 3,
                    amount: 25,
                    date: '2017-07-02',
                });
                assertCurrentState(
                    addIdLookup({
                        transactions: expandFields([
                            {
                                id: 2,
                                amount: 10,
                                date: '2017-07-03',
                                balance: 85,
                            },
                            {
                                id: 3,
                                amount: 25,
                                date: '2017-07-02',
                                balance: 75,
                            },
                            {
                                id: 1,
                                amount: 50,
                                date: '2017-07-01',
                                balance: 50,
                            },
                        ]),
                        priorBalance: 0,
                    })
                );
            });

            it('should keep transactions sorted by date when inserting at end', function () {
                setupState({
                    transactions: expandFields([
                        { id: 2, amount: 10, date: '2017-07-03', balance: 70 },
                        { id: 1, amount: 50, date: '2017-07-02', balance: 50 },
                    ]),
                    priorBalance: 0,
                });
                transactionsStore[mutations.addTransaction]({
                    id: 3,
                    amount: 25,
                    date: '2017-07-01',
                });
                assertCurrentState(
                    addIdLookup({
                        transactions: expandFields([
                            {
                                id: 2,
                                amount: 10,
                                date: '2017-07-03',
                                balance: 85,
                            },
                            {
                                id: 1,
                                amount: 50,
                                date: '2017-07-02',
                                balance: 75,
                            },
                            {
                                id: 3,
                                amount: 25,
                                date: '2017-07-01',
                                balance: 25,
                            },
                        ]),
                        priorBalance: 0,
                    })
                );
            });
        });

        describe('updateTransaction', function () {
            it('should update matching transaction details', function () {
                setupState({
                    transactions: [
                        {
                            id: 1,
                            payee: '',
                            notes: '',
                            amount: 30,
                            balance: 100,
                        },
                    ],
                });
                transactionsStore[mutations.updateTransaction]({
                    id: 1,
                    patch: {
                        payee: 'Georgina',
                        notes: 'My notes',
                    },
                });
                assertCurrentState(
                    addIdLookup({
                        transactions: [
                            {
                                id: 1,
                                payee: 'Georgina',
                                notes: 'My notes',
                                amount: 30,
                                balance: 100,
                            },
                        ],
                    })
                );
            });

            it('should throw error when transaction is not found', function () {
                try {
                    transactionsStore[mutations.updateTransaction]({ id: 1 });
                } catch (error) {
                    assert.equal(error.message, 'No transaction with ID 1');
                    return;
                }
                assert.fail('Should have thrown an error');
            });

            describe('Amount Changes', function () {
                it('should update balances when amount changes', function () {
                    setupState({
                        transactions: [
                            { id: 1, amount: 30, balance: 100 },
                            { id: 2, amount: 20, balance: 70 },
                        ],
                        priorBalance: 50,
                    });
                    transactionsStore[mutations.updateTransaction]({
                        id: 2,
                        patch: {
                            amount: -10,
                        },
                    });
                    assertCurrentState(
                        addIdLookup({
                            transactions: [
                                { id: 1, amount: 30, balance: 70 },
                                { id: 2, amount: -10, balance: 40 },
                            ],
                            priorBalance: 50,
                        })
                    );
                });
            });

            describe('Date Changes', function () {
                it('should maintain sort order and balances when date is made more recent', function () {
                    setupState({
                        transactions: [
                            {
                                id: 1,
                                amount: 30,
                                date: '2017-07-03',
                                balance: 100,
                            },
                            {
                                id: 2,
                                amount: 20,
                                date: '2017-07-02',
                                balance: 70,
                            },
                        ],
                        priorBalance: 50,
                    });
                    transactionsStore[mutations.updateTransaction]({
                        id: 2,
                        patch: {
                            date: '2017-07-04',
                        },
                    });
                    assertCurrentState(
                        addIdLookup({
                            transactions: [
                                {
                                    id: 2,
                                    amount: 20,
                                    date: '2017-07-04',
                                    balance: 100,
                                },
                                {
                                    id: 1,
                                    amount: 30,
                                    date: '2017-07-03',
                                    balance: 80,
                                },
                            ],
                            priorBalance: 50,
                        })
                    );
                });

                it('should maintain sort order and balances when date is made less recent', function () {
                    setupState({
                        transactions: [
                            {
                                id: 1,
                                amount: 30,
                                date: '2017-07-03',
                                balance: 100,
                            },
                            {
                                id: 2,
                                amount: 20,
                                date: '2017-07-02',
                                balance: 70,
                            },
                        ],
                        priorBalance: 50,
                    });
                    transactionsStore[mutations.updateTransaction]({
                        id: 1,
                        patch: {
                            date: '2017-07-01',
                        },
                    });
                    assertCurrentState(
                        addIdLookup({
                            transactions: [
                                {
                                    id: 2,
                                    amount: 20,
                                    date: '2017-07-02',
                                    balance: 100,
                                },
                                {
                                    id: 1,
                                    amount: 30,
                                    date: '2017-07-01',
                                    balance: 80,
                                },
                            ],
                            priorBalance: 50,
                        })
                    );
                });
            });
        });

        describe('removeTransaction', function () {
            it('should remove the transaction', function () {
                setupState({ transactions: [{ id: 1 }] });
                transactionsStore[mutations.removeTransaction]({
                    id: 1,
                });
                assertCurrentState(addIdLookup({ transactions: [] }));
            });

            it('should update balances after the removed transaction', function () {
                setupState({
                    transactions: [
                        { id: 3, amount: 10, balance: 50 },
                        { id: 2, amount: 30, balance: 40 },
                        { id: 1, amount: 10, balance: 10 },
                    ],
                });
                transactionsStore[mutations.removeTransaction]({
                    id: 2,
                });
                assertCurrentState(
                    addIdLookup({
                        transactions: [
                            { id: 3, amount: 10, balance: 20 },
                            { id: 1, amount: 10, balance: 10 },
                        ],
                    })
                );
            });

            it('should update balances using prior balance when the first transaction is removed', function () {
                setupState({
                    transactions: expandFields([
                        { id: 3, amount: 10, balance: 50, date: '2017-07-03' },
                        { id: 2, amount: 30, balance: 40, date: '2017-07-02' },
                        {
                            id: 1,
                            amount: 10,
                            balance: 10,
                            date: '2017-07-01',
                        },
                    ]),
                    priorBalance: 70,
                });
                transactionsStore[mutations.removeTransaction](
                    ensureAllFieldsPresent({
                        id: 1,
                        amount: 10,
                        balance: 10,
                        date: '2017-07-01',
                    })
                );
                assertCurrentState(
                    addIdLookup({
                        transactions: expandFields([
                            {
                                id: 3,
                                amount: 10,
                                balance: 110,
                                date: '2017-07-03',
                            },
                            {
                                id: 2,
                                amount: 30,
                                balance: 100,
                                date: '2017-07-02',
                            },
                        ]),
                        priorBalance: 70,
                    })
                );
            });
        });
    });

    describe('Actions', function () {
        const txStoreSpies = {};
        beforeEach(function () {
            Object.values(mutations).forEach(key => {
                txStoreSpies[key] = sinon.spy(transactionsStore, key, ['get']);
            });
        });
        describe('loadTransactions', function () {
            it('should load transactions from server', async function () {
                const response = {
                    transactions: [{ id: 3 }, { id: 4 }],
                    priorBalance: 12300,
                };
                client.transactions
                    .withArgs({ accountId: 'account-1' })
                    .resolves(response);
                setupState({
                    transactions: [{ id: 1 }, { id: 2 }],
                    transactionsById: {},
                    searchOptions: {},
                });
                await transactionsStore[actions.loadTransactions]({
                    accountId: 'account-1',
                });

                txStoreSpies[mutations.setTransactions].get.calledWith({
                    transactions: [],
                    priorBalance: 0,
                    searchOptions: { accountId: 'account-1' },
                    loadingState: loadingStates.LOADING,
                });
                txStoreSpies[mutations.setTransactions].get.calledWith(
                    response
                );
            });
        });

        describe('addTransaction', function () {
            let newTransaction;
            let initialTransactionProperties;
            let serverTransaction;
            beforeEach(function () {
                initialTransactionProperties = {
                    payee: '',
                    amount: 0,
                    date: format(new Date(), 'yyyy-MM-dd'),
                    notes: '',
                    accountId: 'account-1',
                    type: 'expense',
                    categoryId: null,
                };
                newTransaction = Object.assign(
                    { id: 'new-transaction' },
                    initialTransactionProperties
                );
                serverTransaction = Object.assign(
                    {},
                    initialTransactionProperties,
                    { id: 'assigned-id' }
                );
                rootStore[stateActions.selectTransaction] = sinon.spy();
                accountsStore.accounts = [{ id: 'account-1' }];
            });

            it('should add new transaction and notify server', async function () {
                client.createTransaction
                    .withArgs(initialTransactionProperties)
                    .resolves(serverTransaction);
                await transactionsStore[actions.addTransaction]();
                txStoreSpies[mutations.addTransaction].get.calledWith(
                    newTransaction
                );
                txStoreSpies[mutations.updateTransaction].get.calledWith({
                    id: 'new-transaction',
                    patch: serverTransaction,
                });
                sinon.assert.calledWith(
                    client.createTransaction,
                    initialTransactionProperties
                );
                sinon.assert.calledWith(
                    rootStore[stateActions.selectTransaction],
                    { id: serverTransaction.id, scheduled: false }
                );
            });

            it('should remove transaction again if create fails', async function () {
                client.createTransaction.rejects('Invalid transaction');
                let err = null;
                try {
                    await transactionsStore[actions.addTransaction](
                        Object.assign({}, newTransaction)
                    );
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                txStoreSpies[mutations.addTransaction].get.calledWith(
                    Object.assign({}, newTransaction)
                );
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    Object.assign(newTransaction, {
                        id: 'new-transaction',
                    })
                );
            });
        });

        describe('updateTransaction', function () {
            it('should modify transaction', async function () {
                const transaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                };
                const patch = { payee: 'Payee2', notes: 'Notes' };
                const modifiedTransaction = Object.assign(
                    {},
                    transaction,
                    patch
                );
                client.updateTransaction
                    .withArgs(modifiedTransaction)
                    .resolves(modifiedTransaction);
                setupState(
                    addIdLookup({
                        transactions: [transaction],
                        priorBalance: 100,
                    })
                );
                await transactionsStore[actions.updateTransaction]({
                    id: 1,
                    patch,
                });

                txStoreSpies[mutations.updateTransaction].get.calledWith({
                    id: 1,
                    patch,
                });
            });

            it('should rollback transaction update if server rejects change', async function () {
                const transaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                };
                const patch = { payee: 'Payee2', notes: 'Notes' };
                client.updateTransaction.rejects('Server says no');
                setupState(
                    addIdLookup({
                        transactions: [transaction],
                        priorBalance: 100,
                    })
                );
                let err = null;
                try {
                    await transactionsStore[actions.updateTransaction]({
                        id: 1,
                        patch,
                    });
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                txStoreSpies[mutations.updateTransaction].get.calledWith({
                    id: 1,
                    patch,
                });
                txStoreSpies[mutations.updateTransaction].get.calledWith({
                    id: 1,
                    patch: transaction,
                });
            });

            it('should not update balance of toAccount when updating a scheduled transfer', async function () {
                const transaction = {
                    id: 1,
                    amount: -10,
                    payee: 'Payee1',
                    type: 'expense',
                    balance: 100,
                    date: '2016-07-13',
                    recurPeriod: 'ONCE',
                };
                const patch = { type: 'transfer', toAccountId: 'account-2' };
                const modifiedTransaction = Object.assign(
                    {},
                    transaction,
                    patch
                );
                client.updateTransaction
                    .withArgs(modifiedTransaction)
                    .resolves(modifiedTransaction);
                setupState(
                    addIdLookup({
                        transactions: [transaction],
                        priorBalance: 100,
                    })
                );
                accountsStore[accountActions.adjustBalance] = sinon.spy();
                await transactionsStore[actions.updateTransaction]({
                    id: 1,
                    patch,
                });
                sinon.assert.callCount(
                    accountsStore[accountActions.adjustBalance],
                    0
                );
            });

            [
                {
                    name: 'becomes a transfer',
                    transaction: {
                        id: 1,
                        amount: -10,
                        payee: 'Payee1',
                        type: 'expense',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { type: 'transfer', toAccountId: 'account-2' },
                    adjustBalance: [{ id: 'account-2', balance: 10 }],
                },
                {
                    name: 'stops being a transfer',
                    transaction: {
                        id: 1,
                        amount: -10,
                        payee: 'Payee1',
                        type: 'transfer',
                        toAccountId: 'account-2',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { type: 'expense', toAccountId: null },
                    adjustBalance: [{ id: 'account-2', balance: -10 }],
                },
                {
                    name: 'stops being a transfer and changes amount',
                    transaction: {
                        id: 1,
                        accountId: 'account-1',
                        amount: -10,
                        payee: 'Payee1',
                        type: 'transfer',
                        toAccountId: 'account-2',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { type: 'income', toAccountId: null, amount: 20 },
                    adjustBalance: [
                        { id: 'account-1', balance: 30 },
                        { id: 'account-2', balance: -10 },
                    ],
                },
                {
                    name: 'changes amount',
                    transaction: {
                        id: 1,
                        accountId: 'account-1',
                        amount: -10,
                        payee: 'Payee1',
                        type: 'transfer',
                        toAccountId: 'account-2',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { amount: -30 },
                    adjustBalance: [
                        { id: 'account-1', balance: -20 },
                        { id: 'account-2', balance: 20 },
                    ],
                },
                {
                    name: 'changes amount when not a transfer',
                    transaction: {
                        id: 1,
                        accountId: 'account-1',
                        amount: -10,
                        payee: 'Payee1',
                        type: 'expense',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { amount: -30 },
                    adjustBalance: [{ id: 'account-1', balance: -20 }],
                },
                {
                    name: 'changes destination account',
                    transaction: {
                        id: 1,
                        accountId: 'account-1',
                        amount: -10,
                        payee: 'Payee1',
                        type: 'transfer',
                        toAccountId: 'account-2',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { toAccountId: 'account-3' },
                    adjustBalance: [
                        { id: 'account-2', balance: -10 },
                        { id: 'account-3', balance: 10 },
                    ],
                },
                {
                    name: 'changes destination account and amount',
                    transaction: {
                        id: 1,
                        accountId: 'account-1',
                        amount: -10,
                        payee: 'Payee1',
                        type: 'transfer',
                        toAccountId: 'account-2',
                        balance: 100,
                        date: '2016-07-13',
                    },
                    patch: { toAccountId: 'account-3', amount: -30 },
                    adjustBalance: [
                        { id: 'account-1', balance: -20 },
                        { id: 'account-2', balance: -10 },
                        { id: 'account-3', balance: 30 },
                    ],
                },
            ].forEach(scenario => {
                it(`should update balance of other account when a transaction ${scenario.name}`, async function () {
                    const transaction = ensureAllFieldsPresent(
                        scenario.transaction
                    );
                    const patch = scenario.patch;
                    const modifiedTransaction = Object.assign(
                        {},
                        transaction,
                        patch
                    );
                    client.updateTransaction
                        .withArgs(modifiedTransaction)
                        .resolves(modifiedTransaction);
                    setupState(
                        addIdLookup({
                            transactions: [transaction],
                            priorBalance: 100,
                        })
                    );
                    accountsStore[accountActions.adjustBalance] = sinon.spy();
                    await transactionsStore[actions.updateTransaction]({
                        id: 1,
                        patch,
                    });
                    txStoreSpies[mutations.updateTransaction].get.calledWith({
                        id: 1,
                        patch,
                    });
                    scenario.adjustBalance.forEach(param =>
                        sinon.assert.calledWith(
                            accountsStore[accountActions.adjustBalance],
                            param
                        )
                    );
                    sinon.assert.callCount(
                        accountsStore[accountActions.adjustBalance],
                        scenario.adjustBalance.length
                    );
                });
            });
        });

        describe('deleteTransaction', function () {
            it('should remove the transaction', async function () {
                const transaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                };
                client.deleteTransaction.withArgs(transaction).resolves();
                setupState(
                    addIdLookup({
                        transactions: [transaction],
                        priorBalance: 100,
                    })
                );
                await transactionsStore[actions.deleteTransaction](transaction);
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    transaction
                );
                sinon.assert.calledWith(client.deleteTransaction, transaction);
            });

            it('should re-add transaction if server rejects deletion', async function () {
                const transaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                };
                client.deleteTransaction.withArgs(transaction).rejects();

                setupState(
                    addIdLookup({
                        transactions: [transaction],
                        priorBalance: 100,
                    })
                );
                let err = null;
                try {
                    await transactionsStore[actions.deleteTransaction](
                        transaction
                    );
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    transaction
                );
                txStoreSpies[mutations.addTransaction].get.calledWith(
                    transaction
                );
            });
        });

        describe('payTransaction', function () {
            it('should remove scheduled transaction if it is once off', async function () {
                const scheduledTransaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                    recurPeriod: 'ONCE',
                    accountId: 'account1',
                };
                client.deleteTransaction
                    .withArgs(scheduledTransaction)
                    .resolves();
                setupState(
                    addIdLookup({
                        transactions: [scheduledTransaction],
                        priorBalance: 100,
                    })
                );
                await transactionsStore[actions.payTransaction](
                    scheduledTransaction
                );
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    scheduledTransaction
                );

                sinon.assert.calledWith(
                    client.deleteTransaction,
                    scheduledTransaction
                );
                sinon.assert.calledWith(client.createTransaction, {
                    amount: 10,
                    payee: 'Payee1',
                    date: '2016-07-13',
                    accountId: 'account1',
                });
            });

            [
                {
                    description: 'repeating daily',
                    scheduledDate: '2016-07-13',
                    recurPeriod: 'DAY',
                    recurEvery: 5,
                    nextScheduledDate: '2016-07-18',
                },
                {
                    description: 'repeating weekly',
                    scheduledDate: '2017-07-13',
                    recurPeriod: 'WEEK',
                    recurEvery: 6,
                    nextScheduledDate: '2017-08-24',
                },
                {
                    description: 'repeating monthly',
                    scheduledDate: '2016-10-13',
                    recurPeriod: 'MONTH',
                    recurEvery: 9,
                    nextScheduledDate: '2017-07-13',
                },
                {
                    description: 'repeating monthly',
                    scheduledDate: '2016-10-13',
                    recurPeriod: 'YEAR',
                    recurEvery: 4,
                    nextScheduledDate: '2020-10-13',
                },
            ].forEach(params => {
                it(`should move date of scheduled transaction to next repeat when ${params.description}`, async function () {
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
                    const modifiedTransaction = Object.assign(
                        {},
                        scheduledTransaction,
                        { date: params.nextScheduledDate }
                    );
                    client.updateTransaction
                        .withArgs(scheduledTransaction)
                        .resolves(modifiedTransaction);
                    client.createTransaction.resolves();

                    setupState(
                        addIdLookup({
                            transactions: [scheduledTransaction],
                            priorBalance: 0,
                        })
                    );
                    await transactionsStore[actions.payTransaction](
                        scheduledTransaction
                    );
                    txStoreSpies[mutations.updateTransaction].get.calledWith({
                        id: scheduledTransaction.id,
                        patch: { date: params.nextScheduledDate },
                    });

                    sinon.assert.calledWith(
                        client.updateTransaction,
                        modifiedTransaction
                    );
                    sinon.assert.calledWith(client.createTransaction, {
                        amount: 10,
                        payee: 'Payee1',
                        date: params.scheduledDate,
                        accountId: 'account1',
                    });
                });
            });

            it('should update balance of account', async function () {
                const scheduledTransaction = {
                    id: 1,
                    amount: 10,
                    payee: 'Payee1',
                    balance: 100,
                    date: '2016-07-13',
                    recurPeriod: 'ONCE',
                    accountId: 'account1',
                };
                client.deleteTransaction
                    .withArgs(scheduledTransaction)
                    .resolves();
                setupState(
                    addIdLookup({
                        transactions: [scheduledTransaction],
                        priorBalance: 100,
                    })
                );
                accountsStore[accountActions.adjustBalance] = sinon.spy();
                await transactionsStore[actions.payTransaction](
                    scheduledTransaction
                );
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    scheduledTransaction
                );
                sinon.assert.calledWith(
                    accountsStore[accountActions.adjustBalance],
                    { id: 'account1', balance: scheduledTransaction.amount }
                );
            });

            it('should update balance of both accounts when transaction is a transfer', async function () {
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
                client.deleteTransaction
                    .withArgs(scheduledTransaction)
                    .resolves();
                setupState(
                    addIdLookup({
                        transactions: [scheduledTransaction],
                        priorBalance: 100,
                    })
                );
                accountsStore[accountActions.adjustBalance] = sinon.spy();
                await transactionsStore[actions.payTransaction](
                    scheduledTransaction
                );
                txStoreSpies[mutations.removeTransaction].get.calledWith(
                    scheduledTransaction
                );
                sinon.assert.calledWith(
                    accountsStore[accountActions.adjustBalance],
                    { id: 'account1', balance: scheduledTransaction.amount }
                );
                sinon.assert.calledWith(
                    accountsStore[accountActions.adjustBalance],
                    { id: 'account2', balance: -scheduledTransaction.amount }
                );
            });
        });
    });

    function setupState(state) {
        Object.assign(transactionsStore, state);
        state.transactions.forEach(transaction => {
            transactionsStore.transactionsById[transaction.id] = transaction;
        });
    }

    function assertCurrentState(expected) {
        for (const [key, value] of Object.entries(expected)) {
            const actual = transactionsStore[key];
            assert.deepEqual(
                value,
                actual,
                `incorrect ${key}\nexpected: ${value}\nactual: ${actual}`
            );
        }
    }
});
