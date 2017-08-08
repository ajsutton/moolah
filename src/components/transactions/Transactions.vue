<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">{{title}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <create-account :account="selectedAccount"></create-account>
            <v-btn icon
                   @click.native.stop="addTransaction">
                <v-icon>add</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-list two-line style="position: relative">
            <template v-for="transaction in transactions">
                <transaction :transaction="transaction" :key="transaction.id" @selected="editTransaction">
                </transaction>
                <v-divider></v-divider>
            </template>
        </v-list>
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
        data() {
            return {};
        },
        computed: {
            title() {
                return this.accountName(this.accountId);
            },
            ...mapState(['selectedAccountId']),
            ...mapGetters('accounts', ['accountName', 'selectedAccount']),
            ...mapState('transactions', ['transactions']),
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
                this[stateActions.selectAccount](accountId);
            },
            addTransaction() {
                this[transactionActions.addTransaction]();
            },
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, {id: transaction.id, scheduled: false});
            },
            ...mapActions([stateActions.selectAccount]),
            ...mapActions('transactions', [transactionActions.addTransaction]),
        },

        components: {
            MonetaryAmount,
            Transaction,
            CreateAccount,
        },
    };
</script>
