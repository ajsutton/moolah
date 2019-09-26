import updateBalance from "../../../../../src/store/transactions/updateBalance";
import { assert } from "chai";

describe("Balance Updater", function() {
    it("should update all balances when no starting index is supplied", function() {
        const transactions = transactionsWithAmounts(20, -30, 50, 10);
        updateBalance(transactions);
        const expected = addBalances(transactions, 50, 30, 60, 10);
        assert.deepEqual(transactions, expected);
    });

    it("should update balances from the specified starting point", function() {
        const transactions = transactionsWithAmounts(20, -30, 50, 10);
        transactions[2].balance = 100; // Starting balance one before what we expect
        updateBalance(transactions, 1);
        const expected = addBalances(transactions, 90, 70, 100, undefined);
        assert.deepEqual(transactions, expected);
    });

    it("should use priorBalance when supplied", function() {
        const transactions = transactionsWithAmounts(20, -30, 50, 10);
        updateBalance(transactions, undefined, 100);
        const expected = addBalances(transactions, 150, 130, 160, 110);
        assert.deepEqual(transactions, expected);
    });

    it("should use priorBalance when updating from the first transaction", function() {
        const transactions = transactionsWithAmounts(20, -30, 50, 10);
        updateBalance(transactions, transactions.length - 1, 100);
        const expected = addBalances(transactions, 150, 130, 160, 110);
        assert.deepEqual(transactions, expected);
    });

    function transactionsWithAmounts(...amounts) {
        return amounts.map(amount => ({ amount }));
    }

    function addBalances(transactions, ...balances) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            const transactionWithBalance = { amount: transaction.amount };
            const balance = balances[i];
            if (balance !== undefined) {
                transactionWithBalance.balance = balance;
            }
            result.push(transactionWithBalance);
        }
        return result;
    }
});
