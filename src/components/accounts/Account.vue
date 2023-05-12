<template>
    <div>
        <investment-value
            :accountName="accountName"
            :accountId="accountId"
            v-if="isInvestment"
        ></investment-value>
        <transactions :searchOptions="searchOptions" :title="title">
            <template v-if="selectedAccount" slot="buttons">
                <create-account :account="selectedAccount"></create-account>
                <v-btn icon @click.native.stop="addTransaction">
                    <v-icon>add</v-icon>
                </v-btn>
            </template>
        </transactions>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { actions as stateActions } from '../../store/store';
import { actions as transactionActions } from '../../store/transactions/transactionStore';
import { actions as valueActions } from '../../store/wallets/valuesStore';
import Transactions from '../transactions/Transactions.vue';
import CreateAccount from '../accounts/CreateAccount.vue';
import InvestmentValue from './InvestmentValue.vue';
import AddTransactionMixin from '../util/AddTransactionMixin';

export default {
    props: {
        accountId: String,
        searchOptions: Object,
    },

    data() {
        return {
            selectedTab: 'table',
        };
    },

    mixins: [AddTransactionMixin],

    created() {
        this.loadTransactions();
    },

    watch: {
        $route() {
            this.loadTransactions();
        },
    },

    computed: {
        title() {
            return this.isInvestment ? 'Transactions' : this.accountName;
        },
        selectedAccount() {
            return this.findAccountById(this.accountId);
        },
        accountName() {
            return this.selectedAccount ? this.selectedAccount.name : '';
        },
        isInvestment() {
            return (
                this.selectedAccount &&
                this.selectedAccount.type == 'investment'
            );
        },
        ...mapGetters('accounts', { findAccountById: 'account' }),
    },

    methods: {
        async loadTransactions() {
            const txFuture = this[stateActions.loadTransactions](
                this.searchOptions
            );
            if (this.isInvestment) {
                // Load values
                this[valueActions.loadValues]({
                    accountId: this.accountId,
                    pageSize: 1000000000,
                });
            } else {
                // Clear values
            }
            await txFuture;
        },
        addTransaction() {
            this[transactionActions.addTransaction]({
                accountId: this.accountId,
            });
        },
        ...mapActions([stateActions.loadTransactions]),
        ...mapActions('transactions', [transactionActions.addTransaction]),
        ...mapActions('values', [valueActions.loadValues]),
    },

    components: {
        Transactions,
        CreateAccount,
        InvestmentValue,
    },
};
</script>
