import { assert } from 'chai';
import changeTypePatch from '../../../../../src/components/transactions/changeType';

describe('Change Type', function() {
    let transaction;
    let accounts;
    beforeEach(function() {
        transaction = {
            id: 1,
            payee: 'John',
            notes: 'Notes',
            date: '2017-01-01',
            amount: 30,
            type: 'income',
            accountId: 'account-1',
            balance: 100,
        };
        accounts = [
            { id: 'account-1' },
            { id: 'account-2' },
            { id: 'account-3' },
        ];
    });

    describe('Invert amount', function() {
        [
            ['income', 'expense', true, null],
            ['income', 'transfer', true, 'account-2'],
            ['expense', 'income', true, null],
            ['expense', 'transfer', false, 'account-2'],
            ['transfer', 'income', true, null],
            ['transfer', 'expense', false, null],
        ].forEach(([originalType, newType, negateAmount, toAccountId]) => {
            it(`should ${
                negateAmount ? 'negate' : 'not negate'
            } amount when changing from ${originalType} to ${newType}`, function() {
                transaction.type = originalType;
                const result = changeTypePatch(transaction, newType, accounts);
                const expected = {
                    id: transaction.id,
                    patch: {
                        type: newType,
                        toAccountId: toAccountId,
                    },
                };
                if (negateAmount) {
                    expected.patch.amount = -transaction.amount;
                }
                assert.deepEqual(result, expected);
            });
        });
    });
});
