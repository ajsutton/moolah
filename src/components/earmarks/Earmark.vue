<template>
    <div>
        <v-card class="mb-3">
            <v-toolbar card class="white" prominent>
                <v-toolbar-title class="body-2 grey--text">{{earmarkName}}</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-divider></v-divider>
            <savings-goal-notice v-if="selectedEarmark !== undefined" :selectedAccount="selectedEarmark"></savings-goal-notice>
        </v-card>

        <transactions :searchOptions="searchOptions" title="Transactions">
            <template slot="buttons">
                <create-earmark :earmark="selectedEarmark"></create-earmark>
                <v-btn icon
                       @click.native.stop="addTransaction">
                    <v-icon>add</v-icon>
                </v-btn>
            </template>
        </transactions>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import {actions as stateActions} from '../../store/store';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import Transactions from '../transactions/Transactions.vue';
    import SavingsGoalNotice from './SavingsGoalNotice.vue';
    import CreateEarmark from './CreateEarmark.vue';
    import AddTransactionMixin from '../util/AddTransactionMixin';

    export default {
        props: {
            earmarkId: String,
            searchOptions: Object,
        },

        mixins: [AddTransactionMixin],

        created() {
            this.loadTransactions();
        },

        watch: {
            '$route'() {
                this.loadTransactions();
            },
        },

        computed: {
            selectedEarmark() {
                return this.findEarmarkById(this.earmarkId);
            },
            earmarkName() {
                return this.selectedEarmark ? this.selectedEarmark.name : '';
            },
            ...mapGetters('earmarks', {findEarmarkById: 'earmark'}),
        },

        methods: {
            async loadTransactions() {
                await this[stateActions.loadTransactions](this.searchOptions);
            },
            addTransaction() {
                this[transactionActions.addTransaction]({earmark: this.earmarkId, accountId: undefined, type: 'income'});
            },
            ...mapActions([stateActions.loadTransactions]),
            ...mapActions('transactions', [transactionActions.addTransaction]),
        },

        components: {
            Transactions,
            SavingsGoalNotice,
            CreateEarmark,
        },
    };
</script>