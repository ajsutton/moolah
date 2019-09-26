import extrapolateBalances from "../../../../../src/components/analysis/netWorthGraphData";
import { assert } from "chai";

describe("Net Worth Graph Data", function() {
    it("should extend last balance to today", function() {
        const result = extrapolateBalances(
            [
                { date: "2017-01-01", balance: 100, availableFunds: 110 },
                { date: "2017-01-02", balance: 130, availableFunds: 120 }
            ],
            [],
            "2017-06-30",
            "2017-08-30"
        );
        assert.deepEqual(result, [
            { date: "2017-01-01", balance: 100, availableFunds: 110 },
            { date: "2017-01-02", balance: 130, availableFunds: 120 },
            { date: "2017-06-30", balance: 130, availableFunds: 120 }
        ]);
    });

    it("should return empty array when input is empty", function() {
        assert.deepEqual(
            extrapolateBalances([], [], "2017-06-30", "2017-08-30"),
            []
        );
    });

    it("should append forecast balances", function() {
        const result = extrapolateBalances(
            [
                { date: "2017-01-01", balance: 100, availableFunds: 110 },
                { date: "2017-01-02", balance: 130, availableFunds: 120 }
            ],
            [
                { date: "2017-07-03", balance: 150, availableFunds: 140 },
                { date: "2017-07-04", balance: 160, availableFunds: 170 }
            ],
            "2017-06-30",
            "2017-08-30"
        );
        assert.deepEqual(result, [
            { date: "2017-01-01", balance: 100, availableFunds: 110 },
            { date: "2017-01-02", balance: 130, availableFunds: 120 },
            {
                date: "2017-06-30",
                balance: 130,
                availableFunds: 120,
                scheduled: 130,
                scheduledAvailableFunds: 120
            },
            {
                date: "2017-07-03",
                scheduled: 150,
                scheduledAvailableFunds: 140
            },
            {
                date: "2017-07-04",
                scheduled: 160,
                scheduledAvailableFunds: 170
            },
            { date: "2017-08-30", scheduled: 160, scheduledAvailableFunds: 170 }
        ]);
    });

    it("should add forecast balances to real balances when they overlap", function() {
        const result = extrapolateBalances(
            [
                { date: "2017-01-01", balance: 100, availableFunds: 110 },
                { date: "2017-01-02", balance: 130, availableFunds: 120 }
            ],
            [
                { date: "2017-06-30", balance: 150, availableFunds: 140 },
                { date: "2017-07-04", balance: 160, availableFunds: 170 }
            ],
            "2017-06-30",
            "2017-08-30"
        );
        assert.deepEqual(result, [
            { date: "2017-01-01", balance: 100, availableFunds: 110 },
            { date: "2017-01-02", balance: 130, availableFunds: 120 },
            {
                date: "2017-06-30",
                balance: 130,
                availableFunds: 120,
                scheduled: 150,
                scheduledAvailableFunds: 140
            },
            {
                date: "2017-07-04",
                scheduled: 160,
                scheduledAvailableFunds: 170
            },
            { date: "2017-08-30", scheduled: 160, scheduledAvailableFunds: 170 }
        ]);
    });
});
