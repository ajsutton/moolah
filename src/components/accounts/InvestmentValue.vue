<template>
    <v-card class="mb-3">
        <v-app-bar flat color="accent">
            <v-toolbar-title>{{ account.name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <edit-investment-value></edit-investment-value>
        </v-app-bar>
        <v-container fluid>
            <v-row v-if="account.value !== undefined">
                <v-card :elevation="0">
                    <v-card-subtitle class="pb-1">Profit/Loss</v-card-subtitle>
                    <v-card-text
                        ><profit-amount
                            :value="account.value"
                            :balance="account.balance"
                        ></profit-amount
                    ></v-card-text>
                </v-card>
            </v-row>
            <v-row>
                <v-col :cols="12" :lg="8">
                    <investment-value-graph></investment-value-graph>
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
import ProfitAmount from '../util/ProfitAmount.vue';

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
        };
    },

    computed: {
        totalValues() {
            return this.values !== undefined ? this.values.length : 0;
        },
        graphData() {
            return {
                type: 'step',
                json: this.values,
                keys: {
                    x: 'date',
                    value: ['value'],
                },
                names: {
                    value: 'Investment Value',
                },
                colors: {
                    value: '#2196F3',
                },
                unload: true,
            };
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
        ...mapState('values', ['values']),
        ...mapGetters('values', ['loading']),
    },

    methods: {
        deleteItem(item) {
            this[valueActions.deleteValue]({
                date: item.date,
                value: item.value,
            });
        },
        ...mapActions('values', [
            valueActions.loadValues,
            valueActions.deleteValue,
        ]),
    },

    components: {
        EditInvestmentValue,
        MonetaryAmount,
        ProfitAmount,
        InvestmentValueGraph,
    },
};
</script>
<style type="text/css">
.actions-table tr > :last-child {
    width: 6em;
}
</style>