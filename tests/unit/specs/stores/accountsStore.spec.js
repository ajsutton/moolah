import { afterEach, beforeEach, describe, it, vi, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { assert } from 'chai';
import {
    actions,
    mutations,
    useAccountsStore,
} from '../../../../src/stores/accountsStore';
import client from '@/api/client';

vi.mock('@/api/client', () => {
    const client = {
        accounts: {
            get: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    };
    return { default: client };
});

describe('accountsStore', function () {
    let accountsStore;
    beforeEach(function () {
        setActivePinia(createPinia());
        accountsStore = useAccountsStore();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Actions', function () {
        it('should load accounts', async function () {
            const account1 = { name: 'Account1', type: 'bank', balance: 2300 };
            const expectedAccounts = [account1];
            client.accounts.get.mockImplementationOnce(async () => {
                return { accounts: expectedAccounts };
            });
            await accountsStore[actions.loadAccounts]();
            assert.deepEqual(accountsStore.accounts, expectedAccounts);
        });

        describe('Create Account', function () {
            it('should create a new account', async function () {
                const newAccount = {
                    name: 'New Account',
                    type: 'cc',
                    balance: 123456,
                };
                client.accounts.create.mockImplementationOnce(async args => {
                    assert.deepEqual(args, newAccount);
                    return {
                        id: 'assigned-id',
                        ...newAccount,
                    };
                });
                await accountsStore[actions.createAccount](newAccount);
                const accountWithId = Object.assign(
                    { id: 'assigned-id' },
                    newAccount
                );
                assert.deepEqual(accountsStore.accounts, [accountWithId]);
            });

            it('should remove account again if create fails', async function () {
                const newAccount = {
                    name: 'New Account',
                    type: 'cc',
                    balance: 123456,
                };
                client.accounts.create.mockImplementationOnce(async args => {
                    assert.deepEqual(args, newAccount);
                    throw new Error('Fetch failed');
                });
                let err = null;
                try {
                    await accountsStore[actions.createAccount](newAccount);
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                assert.deepEqual(accountsStore.accounts, []);
            });
        });

        describe('Update Account', function () {
            it('should update account and notify server', async function () {
                const originalAccount = {
                    id: 'abc',
                    name: 'Old Name',
                    type: 'bank',
                    position: 1,
                };
                const modifiedAccount = {
                    id: 'abc',
                    name: 'New Name',
                    type: 'cc',
                    position: 3,
                };

                client.accounts.update.mockImplementationOnce(async args => {
                    assert.deepEqual(args, modifiedAccount);
                    return modifiedAccount;
                });
                accountsStore.accounts = [originalAccount];
                await accountsStore[actions.updateAccount]({
                    id: 'abc',
                    patch: modifiedAccount,
                });
                assert.deepEqual(accountsStore.account('abc'), modifiedAccount);
                expect(client.accounts.update).toHaveBeenCalled(1);
            });

            it('should rollback account change if server rejects it', async function () {
                const originalAccount = {
                    id: 'abc',
                    name: 'Old Name',
                    type: 'bank',
                    position: 1,
                };
                const modifiedAccount = {
                    id: 'abc',
                    name: 'New Name',
                    type: 'cc',
                    position: 3,
                };
                accountsStore.accounts = [originalAccount];
                client.accounts.update.mockImplementationOnce(async args => {
                    assert.deepEqual(args, modifiedAccount);
                    throw new Error('Fetch failed');
                });
                let err = null;
                try {
                    await accountsStore[actions.updateAccount]({
                        id: 'abc',
                        patch: modifiedAccount,
                    });
                } catch (error) {
                    err = error;
                }
                assert.isNotNull(err);
                assert.deepEqual(accountsStore.account('abc'), originalAccount);
            });
        });

        describe('Adjust Balance', function () {
            it('should update account with new balance', async function () {
                const originalAccount = {
                    id: 'abc',
                    name: 'Account Name',
                    type: 'bank',
                    position: 1,
                    balance: 30,
                };
                accountsStore.accounts = [originalAccount];
                await accountsStore[actions.adjustBalance]({
                    id: 'abc',
                    balance: 10,
                });
                assert.equal(accountsStore.account('abc').balance, 40);
            });
        });
    });

    describe('Mutations', function () {
        it('should replace accounts', function () {
            accountsStore.accounts = [{ name: '1' }, { name: '2' }];
            const newAccounts = [{ name: '3' }];
            accountsStore[mutations.setAccounts](newAccounts);
            assert.deepEqual(accountsStore.accounts, newAccounts);
        });

        it('should add an account to start of list', function () {
            accountsStore.accounts = [{ name: '1' }, { name: '2' }];
            const newAccount = { name: '3' };
            accountsStore[mutations.addAccount](newAccount);
            assert.deepEqual(accountsStore.accounts, [
                { name: '3' },
                { name: '1' },
                { name: '2' },
            ]);
        });

        it('should remove accounts based on ID', function () {
            accountsStore.accounts = [
                { id: '1', name: 'old name' },
                { id: '2', name: 'name2' },
            ];
            accountsStore[mutations.removeAccount]({
                id: '1',
                name: 'new name',
            });
            assert.deepEqual(accountsStore.accounts, [
                { id: '2', name: 'name2' },
            ]);
        });

        it('should update an account id', function () {
            accountsStore.accounts = [
                { id: '1', name: 'old name', type: 'bank' },
                { id: '2', name: 'name2', type: 'bank' },
            ];
            accountsStore[mutations.updateAccount]({
                id: '2',
                patch: {
                    id: '3',
                    name: 'new name',
                    type: 'cc',
                },
            });
            assert.deepEqual(accountsStore.accounts, [
                { id: '1', name: 'old name', type: 'bank' },
                { id: '3', name: 'new name', type: 'cc' },
            ]);
        });
    });
});
