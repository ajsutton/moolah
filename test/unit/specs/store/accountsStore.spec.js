import sinon from 'sinon';
import {assert} from 'chai';
import {actions, mutations} from '../../../../src/store/accounts/accountsStore';
import accountsStoreLoader from 'inject-loader!../../../../src/store/accounts/accountsStore';
import testAction from './testAction';

describe('accountsStore', function() {
    let client;
    let accountsStore;
    beforeEach(function() {
        client = {
            accounts: {
                get: sinon.stub(),
                create: sinon.stub(),
                update: sinon.stub(),
            }
        };
        accountsStore = accountsStoreLoader({
            '../../api/client': client,
        }).default;
    });

    describe('Actions', function() {
        it('should load accounts', async function() {
            const account1 = {name: 'Account1', type: 'bank', balance: 2300};
            const expectedAccounts = [account1];
            client.accounts.get.resolves({accounts: expectedAccounts});
            await testAction(
                accountsStore,
                actions.loadAccounts,
                {state: {accounts: []}},
                [
                    {type: mutations.setAccounts, payload: expectedAccounts},
                ],
            );
        });

        describe('Create Account', function() {
            it('should create a new account', async function() {
                const newAccount = {name: 'New Account', type: 'cc', balance: 123456};
                client.accounts.create.resolves({id: 'assigned-id', ...newAccount});
                await testAction(
                    accountsStore,
                    actions.createAccount,
                    {
                        payload: newAccount,
                        state: {accounts: [{id: 'existing'}]},
                    },
                    [
                        {type: mutations.addAccount, payload: {id: 'new-account', ...newAccount}},
                        {type: mutations.updateAccount, payload: {id: 'new-account', patch: {id: 'assigned-id'}}},
                    ],
                );
            });

            it('should remove account again if create fails', async function() {

                const newAccount = {name: 'New Account', type: 'cc', balance: 123456};
                client.accounts.create.rejects('Fetch failed');
                await testAction(
                    accountsStore,
                    actions.createAccount,
                    {
                        payload: newAccount,
                        state: {accounts: [{id: 'existing'}]},
                        ignoreFailures: true,
                    },
                    [
                        {type: mutations.addAccount, payload: {id: 'new-account', ...newAccount}},
                        {type: mutations.removeAccount, payload: {id: 'new-account', ...newAccount}},
                    ],
                );
            });
        });

        describe('Update Account', function() {
            it('should update account and notify server', async function() {
                const originalAccount = {id: 'abc', name: 'Old Name', type: 'bank', position: 1};
                const modifiedAccount = {id: 'abc', name: 'New Name', type: 'cc', position: 3};
                client.accounts.update.resolves(modifiedAccount);
                await testAction(
                    accountsStore,
                    actions.updateAccount,
                    {
                        payload: {id: 'abc', patch: modifiedAccount},
                        state: {accounts: [originalAccount]},
                    },
                    [
                        {type: mutations.updateAccount, payload: {id: 'abc', patch: modifiedAccount}},
                    ],
                );
                sinon.assert.calledWith(client.accounts.update, modifiedAccount);
            });

            it('should rollback account change if server rejects it', async function() {
                const originalAccount = {id: 'abc', name: 'Old Name', type: 'bank', position: 1};
                const modifiedAccount = {id: 'abc', name: 'New Name', type: 'cc', position: 3};
                client.accounts.update.rejects('Fetch failed');
                await testAction(
                    accountsStore,
                    actions.updateAccount,
                    {
                        payload: {id: 'abc', patch: modifiedAccount},
                        state: {accounts: [originalAccount]},
                        ignoreFailures: true,
                    },
                    [
                        {type: mutations.updateAccount, payload: {id: 'abc', patch: modifiedAccount}},
                        {type: mutations.updateAccount, payload: {id: 'abc', patch: Object.assign({}, originalAccount)}},
                    ],
                );
            });
        });

        describe('Adjust Balance', function() {
            it('should update account with new balance', async function() {
                const originalAccount = {id: 'abc', name: 'Account Name', type: 'bank', position: 1, balance: 30};
                await testAction(
                    accountsStore,
                    actions.adjustBalance,
                    {
                        payload: {accountId: 'abc', amount: 10},
                        state: {accounts: [originalAccount]},
                    },
                    [
                        {type: mutations.updateAccount, payload: {id: 'abc', patch: {balance: 40}}},
                    ],
                );
            });
        });
    });

    describe('Mutations', function() {
        it('should replace accounts', function() {
            const state = {accounts: [{name: '1'}, {name: '2'}]};
            const newAccounts = [{name: '3'}];
            accountsStore.mutations[mutations.setAccounts](state, newAccounts);
            assert.deepEqual(state.accounts, newAccounts);
        });

        it('should add an account to start of list', function() {
            const state = {accounts: [{name: '1'}, {name: '2'}]};
            const newAccount = {name: '3'};
            accountsStore.mutations[mutations.addAccount](state, newAccount);
            assert.deepEqual(state.accounts, [{name: '3'}, {name: '1'}, {name: '2'}]);
        });

        it('should remove accounts based on ID', function() {
            const state = {accounts: [{id: '1', name: 'old name'}, {id: '2', name: 'name2'}]};
            accountsStore.mutations[mutations.removeAccount](state, {id: '1', name: 'new name'});
            assert.deepEqual(state.accounts, [{id: '2', name: 'name2'}]);
        });

        it('should update an account id', function() {
            const state = {accounts: [{id: '1', name: 'old name', type: 'bank'}, {id: '2', name: 'name2', type: 'bank'}]};
            accountsStore.mutations[mutations.updateAccount](state, {
                id: '2',
                patch: {
                    id: '3',
                    name: 'new name',
                    type: 'cc',
                },
            });
            assert.deepEqual(state.accounts, [{id: '1', name: 'old name', type: 'bank'}, {id: '3', name: 'new name', type: 'cc'}]);
        });
    });
});
