<template>
    <v-card class="mb-3">
        <v-app-bar flat color="accent">
            <v-toolbar-title>{{ accountName }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <edit-investment-value></edit-investment-value>
        </v-app-bar>
        <v-container fluid>
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

export default {
    props: {
        accountName: String,
        accountId: String,
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
        ...mapState('values', ['values']),
        ...mapGetters('values', ['loading']),
    },

    watch: {
        accountId(accountId) {
            const pageSize = 1000000000;
            this[valueActions.loadValues]({
                accountId,
                page: options.page,
                pageSize,
            });
        },
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
        InvestmentValueGraph,
    },
};
</script>
<style type="text/css">
.actions-table tr > :last-child {
    width: 6em;
}
</style>
