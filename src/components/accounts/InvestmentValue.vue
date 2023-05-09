<template>
    <v-card class="mb-3">
        <v-app-bar flat color="accent">
            <v-toolbar-title>{{ accountName }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <edit-investment-value></edit-investment-value>
        </v-app-bar>
        <v-container fluid>
            <v-row>
                <v-col :cols="12" :lg="8">GRAPH!</v-col>
                <v-col :cols="12" :lg="4">
                    <v-data-table
                        dense
                        :headers="headers"
                        :items="values"
                        :options.sync="options"
                        :server-items-length="totalValues"
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
        ...mapState('values', ['values']),
        ...mapGetters('values', ['loading']),
    },

    watch: {
        options(options) {
            const pageSize =
                options.itemsPerPage > 0 ? options.itemsPerPage : 1000000000;
            this[valueActions.loadValues]({
                accountId: this.accountId,
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
    },
};
</script>
<style type="text/css">
.actions-table tr > :last-child {
    width: 6em;
}
</style>
