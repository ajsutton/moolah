import { beforeEach, describe, it } from 'vitest';
import accountBalanceAdjuster from '../../../../../src/stores/transactions/accountBalanceAdjuster';
import { useAccountsStore } from '../../../../../src/stores/accountsStore';
import { useEarmarksStore } from '../../../../../src/stores/earmarksStore';
import { assert } from 'chai';
import { createPinia, setActivePinia } from 'pinia';

describe('Account Balance Adjuster', function () {
    let accountsStore;
    let earmarksStore;
    beforeEach(function () {
        setActivePinia(createPinia());
        accountsStore = useAccountsStore();
        earmarksStore = useEarmarksStore();
        accountsStore.accounts = [
            { id: 'account1', balance: 0 },
            { id: 'account2', balance: 0 },
            { id: 'account3', balance: 0 },
        ];

        earmarksStore.earmarks = [
            { id: 'earmark1', balance: 0, spent: 0, saved: 0 },
            { id: 'earmark2', balance: 0, spent: 0, saved: 0 },
            { id: 'earmark3', balance: 0, spent: 0, saved: 0 },
        ];
    });

    describe('Basic Transactions', function () {
        it('should adjust account balance when amount changes', function () {
            assertAdjustments(
                { amount: 10 },
                { amount: 20 },
                { accountId: 'account1', balance: 10 }
            );
        });

        it('should adjust account balance when transaction added', function () {
            assertAdjustments(
                null,
                { amount: 20 },
                { accountId: 'account1', balance: 20 }
            );
        });

        it('should adjust account balance when transaction removed', function () {
            assertAdjustments({ amount: 20 }, null, {
                accountId: 'account1',
                balance: -20,
            });
        });

        it('should adjust account balance when transaction changes account', function () {
            assertAdjustments(
                { accountId: 'account1', amount: 20 },
                { accountId: 'account2', amount: 20 },
                { accountId: 'account1', balance: -20 },
                { accountId: 'account2', balance: 20 }
            );
        });
    });

    describe('Earmark Transactions', function () {
        describe('Expenses', function () {
            it('should adjust earmark balance, earmark balance and earmark spent when expense amount changes', function () {
                assertAdjustments(
                    { amount: 10, type: 'expense', earmark: 'earmark1' },
                    { amount: 20, type: 'expense', earmark: 'earmark1' },
                    { accountId: 'account1', balance: 10 },
                    { earmarkId: 'earmark1', balance: 10, spent: 10, saved: 0 }
                );
            });

            it('should adjust earmark balance when expense added', function () {
                assertAdjustments(
                    null,
                    { amount: 20, type: 'expense', earmark: 'earmark1' },
                    { accountId: 'account1', balance: 20 },
                    { earmarkId: 'earmark1', balance: 20, spent: 20, saved: 0 }
                );
            });

            it('should adjust earmark balance when expense transaction removed', function () {
                assertAdjustments(
                    { amount: 20, type: 'expense', earmark: 'earmark1' },
                    null,
                    { accountId: 'account1', balance: -20 },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        spent: -20,
                        saved: 0,
                    }
                );
            });

            it('should adjust earmark balance when expense added to earmark', function () {
                assertAdjustments(
                    { amount: 20, type: 'expense' },
                    { amount: 20, type: 'expense', earmark: 'earmark1' },
                    { earmarkId: 'earmark1', balance: 20, spent: 20, saved: 0 }
                );
            });

            it('should adjust earmark balance when expense transaction removed from earmark', function () {
                assertAdjustments(
                    { amount: 20, type: 'expense', earmark: 'earmark1' },
                    { amount: 20, type: 'expense' },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        spent: -20,
                        saved: 0,
                    }
                );
            });

            it('should adjust earmark balance when expense transaction changes earmark', function () {
                assertAdjustments(
                    {
                        accountId: 'account1',
                        amount: 20,
                        type: 'expense',
                        earmark: 'earmark1',
                    },
                    {
                        accountId: 'account1',
                        type: 'expense',
                        earmark: 'earmark2',
                        amount: 20,
                    },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        spent: -20,
                        saved: 0,
                    },
                    { earmarkId: 'earmark2', balance: 20, spent: 20, saved: 0 }
                );
            });
        });

        describe('Income', function () {
            it('should adjust earmark balance, earmark balance and earmark spent when income amount changes', function () {
                assertAdjustments(
                    { amount: 10, type: 'income', earmark: 'earmark1' },
                    { amount: 20, type: 'income', earmark: 'earmark1' },
                    { accountId: 'account1', balance: 10 },
                    { earmarkId: 'earmark1', balance: 10, saved: 10, spent: 0 }
                );
            });

            it('should adjust earmark balance when income added', function () {
                assertAdjustments(
                    null,
                    { amount: 20, type: 'income', earmark: 'earmark1' },
                    { accountId: 'account1', balance: 20 },
                    { earmarkId: 'earmark1', balance: 20, saved: 20, spent: 0 }
                );
            });

            it('should adjust earmark balance when income transaction removed', function () {
                assertAdjustments(
                    { amount: 20, type: 'income', earmark: 'earmark1' },
                    null,
                    { accountId: 'account1', balance: -20 },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        saved: -20,
                        spent: 0,
                    }
                );
            });

            it('should adjust earmark balance when income added to earmark', function () {
                assertAdjustments(
                    { amount: 20, type: 'income' },
                    { amount: 20, type: 'income', earmark: 'earmark1' },
                    { earmarkId: 'earmark1', balance: 20, saved: 20, spent: 0 }
                );
            });

            it('should adjust earmark balance when income transaction removed from earmark', function () {
                assertAdjustments(
                    { amount: 20, type: 'income', earmark: 'earmark1' },
                    { amount: 20, type: 'income' },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        saved: -20,
                        spent: 0,
                    }
                );
            });

            it('should adjust earmark balance when income transaction changes earmark', function () {
                assertAdjustments(
                    {
                        accountId: 'account1',
                        amount: 20,
                        type: 'income',
                        earmark: 'earmark1',
                    },
                    {
                        accountId: 'account1',
                        type: 'income',
                        earmark: 'earmark2',
                        amount: 20,
                    },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        saved: -20,
                        spent: 0,
                    },
                    { earmarkId: 'earmark2', balance: 20, saved: 20, spent: 0 }
                );
            });

            it('should adjust earmark balance when income without account changes', function () {
                assertAdjustments(
                    {
                        accountId: undefined,
                        amount: 20,
                        type: 'income',
                        earmark: 'earmark1',
                    },
                    {
                        accountId: undefined,
                        type: 'income',
                        earmark: 'earmark2',
                        amount: 20,
                    },
                    {
                        earmarkId: 'earmark1',
                        balance: -20,
                        saved: -20,
                        spent: 0,
                    },
                    { earmarkId: 'earmark2', balance: 20, saved: 20, spent: 0 }
                );
            });
        });

        it('should update saved and spent when transaction changes from income to expense', function () {
            assertAdjustments(
                {
                    accountId: 'account1',
                    amount: 20,
                    type: 'income',
                    earmark: 'earmark1',
                },
                {
                    accountId: 'account1',
                    type: 'expense',
                    earmark: 'earmark1',
                    amount: 20,
                },
                { earmarkId: 'earmark1', balance: 0, saved: -20, spent: 20 }
            );
        });

        it('should update saved and spent when transaction changes from expense to income', function () {
            assertAdjustments(
                {
                    accountId: 'account1',
                    amount: 20,
                    type: 'expense',
                    earmark: 'earmark1',
                },
                {
                    accountId: 'account1',
                    type: 'income',
                    earmark: 'earmark1',
                    amount: 20,
                },
                { earmarkId: 'earmark1', balance: 0, saved: 20, spent: -20 }
            );
        });
    });

    describe('Transfers', function () {
        it('should adjust both accounts when amount changes', function () {
            assertAdjustments(
                { amount: 10, toAccountId: 'account2' },
                { amount: 20, toAccountId: 'account2' },
                { accountId: 'account1', balance: 10 },
                { accountId: 'account2', balance: -10 }
            );
        });

        it('should adjust both accounts when transfer added', function () {
            assertAdjustments(
                null,
                { amount: 20, toAccountId: 'account2' },
                { accountId: 'account1', balance: 20 },
                { accountId: 'account2', balance: -20 }
            );
        });

        it('should adjust both accounts when transfer removed', function () {
            assertAdjustments(
                { amount: 20, toAccountId: 'account2' },
                null,
                { accountId: 'account1', balance: -20 },
                { accountId: 'account2', balance: 20 }
            );
        });

        it('should update toAccounts when toAccountId changes', function () {
            assertAdjustments(
                { amount: 20, toAccountId: 'account2' },
                { amount: 20, toAccountId: 'account3' },
                { accountId: 'account2', balance: 20 },
                { accountId: 'account3', balance: -20 }
            );
        });
    });

    it('should ignore scheduled transactions', function () {
        assertAdjustments(
            { amount: 10, toAccountId: 'account2', recurPeriod: 'ONCE' },
            { balance: 20, toAccountId: 'account2', recurPeriod: 'ONCE' }
        );
    });

    function assertAdjustments(
        originalTransaction,
        modifiedTransaction,
        ...adjustments
    ) {
        accountBalanceAdjuster(
            makeTransaction(originalTransaction),
            makeTransaction(modifiedTransaction)
        );
        adjustments.forEach(adjustment => {
            if (adjustment.accountId !== undefined) {
                const account = accountsStore.account(adjustment.accountId);
                assert.equal(account.balance, adjustment.balance);
            } else if (adjustment.earmarkId !== undefined) {
                const earmark = earmarksStore.earmark(adjustment.earmarkId);
                assert.equal(earmark.balance, adjustment.balance);
                assert.equal(earmark.spent, adjustment.spent);
                assert.equal(earmark.saved, adjustment.saved);
            } else {
                assert.fail('Unexpected adjustment');
            }
        });
    }

    function makeTransaction(properties) {
        return properties !== null
            ? Object.assign(
                  {
                      accountId: 'account1',
                      amount: 0,
                      toAccountId: null,
                      type: 'expense',
                  },
                  properties
              )
            : properties;
    }
});
