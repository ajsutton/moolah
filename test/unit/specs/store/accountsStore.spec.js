import sinon from 'sinon';
import {assert} from 'chai';
import {loadAccountsAction} from '../../../../src/store/actions';
import {setAccounts, addAccount, removeAccount, setAccountId} from '../../../../src/store/mutations';
import accountsStoreLoader from 'inject-loader!../../../../src/store/accountsStore';
import testAction from './testAction';


describe('accountsStore', function() {
    let client;
    let accountsStore;
    beforeEach(function() {
        client = {
            accounts: sinon.stub(),
        };
        accountsStore = accountsStoreLoader({
            '../api/client': client,
        }).default;
    });

    it('should load accounts', async function() {
        const account1 = {name: 'Account1', type: 'bank', balance: 2300};
        const expectedAccounts = [account1];
        client.accounts.resolves({accounts: expectedAccounts});
        await testAction(
            accountsStore.actions[loadAccountsAction],
            null,
            {accounts: []},
            [
                {type: setAccounts, payload: expectedAccounts},
            ],
        );
    });

    it('should replace accounts', function() {
        const state = {accounts: [{name: '1'}, {name: '2'}]};
        const newAccounts = [{name: '3'}];
        accountsStore.mutations[setAccounts](state, newAccounts);
        assert.deepEqual(state.accounts, newAccounts);
    });

    it('should add an account to start of list', function() {
        const state = {accounts: [{name: '1'}, {name: '2'}]};
        const newAccount = {name: '3'};
        accountsStore.mutations[addAccount](state, newAccount);
        assert.deepEqual(state.accounts, [{name: '3'}, {name: '1'}, {name: '2'}]);
    });

    it('should remove accounts based on ID', function() {
        const state = {accounts: [{id: '1', name: 'old name'}, {id: '2', name: 'name2'}]};
        accountsStore.mutations[removeAccount](state, {id: '1', name: 'new name'});
        assert.deepEqual(state.accounts, [{id: '2', name: 'name2'}]);
    });

    it('should update an account id', function() {
        const state = {accounts: [{id: '1', name: 'old name'}, {id: '2', name: 'name2'}]};
        accountsStore.mutations[setAccountId](state, {currentId: '2', newId: '3'});
        assert.deepEqual(state.accounts, [{id: '1', name: 'old name'}, {id: '3', name: 'name2'}]);
    });
});
