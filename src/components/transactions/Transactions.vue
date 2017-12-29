<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">{{title}}</v-toolbar-title>
            <template v-if="selectedAccount">
                <v-spacer></v-spacer>
                <create-account :account="selectedAccount"></create-account>
                <v-btn icon
                       @click.native.stop="addTransaction">
                    <v-icon>add</v-icon>
                </v-btn>
            </template>
        </v-toolbar>
        <v-divider></v-divider>
        <v-progress-linear v-bind:indeterminate="true" v-if="loading"></v-progress-linear>
        <v-alert type="error" v-model="error">Failed to load transactions</v-alert>
        <v-list two-line>
            <template v-for="transaction in transactions">
                <transaction :transaction="transaction" :key="transaction.id" @selected="editTransaction">
                </transaction>
                <v-divider></v-divider>
            </template>
        </v-list>
        <div class="text-xs-center">
            <v-pagination :length="numberOfPages" v-model="currentPage"></v-pagination>
        </div>
    </v-card>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import Transaction from './Transaction.vue';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import CreateAccount from '../accounts/CreateAccount.vue';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';

    export default {
        props: ['accountId'],
        computed: {
            title() {
                return this.accountId === undefined ? 'All Transactions' : this.accountName(this.accountId);
            },
            currentPage: {
                get() {
                    return this.pageNumber;
                },
                async set(value) {
                    await this[transactionActions.loadPage](value);
                }
            },
            ...mapState(['selectedAccountId']),
            ...mapGetters('accounts', ['accountName', 'selectedAccount']),
            ...mapGetters('transactions', ['hasNext', 'hasPrevious', 'numberOfPages', 'loading', 'error']),
            ...mapState('transactions', ['transactions', 'pageNumber']),
        },
        data() {
            return {
                loadingMore: false,
            };
        },

        created() {
            this.selectAccount(this.accountId);
        },

        watch: {
            accountId(newAccountId) {
                this.selectAccount(newAccountId);
            },
        },

        methods: {
            async selectAccount(accountId) {
                await this[stateActions.selectAccount](accountId);
            },
            addTransaction() {
                this[transactionActions.addTransaction]();
            },
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, {id: transaction.id, scheduled: false});
            },
            async goNext() {
                this.loadingMore = true;
                try {
                    await this[transactionActions.nextPage]();
                } finally {
                    this.loadingMore = false;
                }
            },
            async goPrevious() {
                this.loadingMore = true;
                try {
                    await this[transactionActions.previousPage]();
                } finally {
                    this.loadingMore = false;
                }
            },
            ...mapActions([stateActions.selectAccount]),
            ...mapActions('transactions', [transactionActions.addTransaction, transactionActions.loadPage]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
        },
    };
</script>
