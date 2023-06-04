<template>
    <v-card class="mb-3">
        <v-app-bar flat color="accent">
            <v-toolbar-title>{{ account.name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <edit-investment-value></edit-investment-value>
        </v-app-bar>
        <v-container fluid>
            <v-row v-if="hasProfitLoss">
                <v-col :cols="4">
                    <value-panel
                        label="Current Value"
                        valueColor="blue"
                        :value="account.value"
                        :percent="profitLossPercent"
                    ></value-panel>
                </v-col>
                <v-col :cols="4">
                    <value-panel
                        class="text-center"
                        label="Invested Amount"
                        valueColor="gray"
                        :value="account.balance"
                    ></value-panel>
                </v-col>
                <v-col :cols="4" class="text-right">
                    <value-panel
                        label="ROI"
                        :value="profitLoss"
                        :percent="earningRates"
                    ></value-panel>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="12" :lg="8">
                    <investment-value-graph
                        :account="account"
                        :balances="balances"
                    ></investment-value-graph>
                </v-col>
                <v-col :cols="12" :lg="4">
                    <v-data-table
                        dense
                        :headers="headers"
                        :items="values"
                        :items-per-page="5"
                        :options.sync="options"
                        :loading="loading"
                        class="actions-table"
                    >
                        <template v-slot:item.value="{ item }">
                            <monetary-amount
                                :value="item.value"
                            ></monetary-amount>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <edit-investment-value
                                :input="item"
                            ></edit-investment-value>
                            <v-icon small @click="deleteItem(item)">
                                mdi-delete
                            </v-icon>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { actions as valueActions } from '../../store/wallets/valuesStore';
import EditInvestmentValue from './EditInvestmentValue.vue';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import InvestmentValueGraph from './InvestmentValueGraph.vue';
import MonetaryAmountAndProfit from '../util/MonetaryAmountAndProfit.vue';
import ValuePanel from './ValuePanel.vue';
import client from '../../api/client';
import debounce from 'debounce';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import parseISO from 'date-fns/parseISO';

export default {
    props: {
        account: Object,
    },

    data() {
        return {
            selectedTab: 'table',
            headers: [
                {
                    text: 'Date',
                    align: 'start',
                    sortable: false,
                    value: 'date',
                },
                {
                    text: 'Value',
                    align: 'end',
                    sortable: false,
                    value: 'value',
                },
                { text: '', align: 'end', value: 'actions', sortable: false },
            ],
            options: {},
            balances: [],
        };
    },

    computed: {
        totalValues() {
            return this.values !== undefined ? this.values.length : 0;
        },
        hasProfitLoss() {
            return this.account.value !== undefined;
        },
        profitLoss() {
            return this.hasProfitLoss
                ? this.account.value - this.account.balance
                : 0;
        },
        profitLossPercent() {
            return this.hasProfitLoss
                ? (this.profitLoss / this.account.balance) * 100
                : 0;
        },

        earningRates() {
            if (this.balances.length == 0 || this.values.length == 0) {
                return 0;
            }
            const calculateFutureValue = function (rate, balances, finalDate) {
                var prevBalance = balances[0].balance;
                var val = prevBalance;
                var date = parseISO(balances[0].date);
                for (var i = 1; i <= balances.length; i++) {
                    const nextDate =
                        i < balances.length
                            ? parseISO(balances[i].date)
                            : parseISO(finalDate);
                    const nextBalance =
                        i < balances.length ? balances[i].balance : prevBalance;
                    const days = differenceInCalendarDays(nextDate, date);
                    if (days > 0) {
                        const interest =
                            val * Math.pow(1 + rate / 12, days / 30);
                        const deposits = nextBalance - prevBalance;
                        prevBalance = nextBalance;
                        val = interest + deposits;
                        date = nextDate;
                    }
                }

                return val;
            };
            var low = -1;
            var high = 1;
            const target = this.values[0].value;
            // Ensure high is above the maximum possible return
            while (
                calculateFutureValue(high, this.balances, this.values[0].date) <
                target
            ) {
                high = high * 2;
            }
            // Ensure low is below the minimum possible return
            while (
                calculateFutureValue(low, this.balances, this.values[0].date) >
                target
            ) {
                low = low * 2;
            }
            while (true) {
                const guess = (high + low) / 2;
                const fv = calculateFutureValue(
                    guess,
                    this.balances,
                    this.values[0].date
                );
                if (low > high) {
                    return guess * 100;
                } else if (fv == target) {
                    // Close enough
                    return guess * 100;
                } else if (fv > target) {
                    // Guess too high
                    high = guess - 0.0001;
                } else {
                    low = guess + 0.0001;
                }
            }
        },

        ...mapState('values', ['values']),
        ...mapState('transactions', ['transactions']),
        ...mapGetters('values', ['loading']),
    },

    watch: {
        transactions: {
            handler: debounce(async function () {
                this.updateBalances();
            }, 100),
            deep: true,
        },
        accountId: debounce(async function () {
            this.updateBalances();
        }, 100),
    },

    methods: {
        deleteItem(item) {
            this[valueActions.deleteValue]({
                date: item.date,
                value: item.value,
            });
        },

        async updateBalances() {
            this.balances = await client.accounts.dailyBalances(
                this.account.id
            );
        },

        async mounted() {
            await this.updateBalances();
        },

        ...mapActions('values', [
            valueActions.loadValues,
            valueActions.deleteValue,
        ]),
    },

    components: {
        EditInvestmentValue,
        MonetaryAmount,
        MonetaryAmountAndProfit,
        InvestmentValueGraph,
        ValuePanel,
    },
};
</script>
<style type="text/css">
.actions-table tr > :last-child {
    width: 6em;
}
</style>
