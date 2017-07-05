import sinon from 'sinon';
import {assert} from 'chai';
import {loadAccountsAction} from '../../../../src/store/actions';
import {setAccounts} from '../../../../src/store/mutations';
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
        testAction(
            accountsStore.actions[loadAccountsAction],
            null,
            {accounts: []},
            [
                { type: setAccounts, payload: expectedAccounts}
            ]
        );
    });
});
