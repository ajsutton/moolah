<template>
    <div>
        <investment-value
            v-if="isInvestment"
            :account="selectedAccount"
        ></investment-value>
        <transactions :search-options="searchOptions" :title="title">
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
import { mapState, mapActions } from 'pinia';
import { useRootStore, actions as stateActions } from '../../stores/root';
import {
    useTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';
import {
    useValuesStore,
    actions as valueActions,
} from '../../stores/valuesStore';
import { useAccountsStore } from '../../stores/accountsStore';
import Transactions from '../transactions/Transactions.vue';
import CreateAccount from '../accounts/CreateAccount.vue';
import InvestmentValue from './InvestmentValue.vue';
import AddTransactionMixin from '../util/AddTransactionMixin';

export default {
    mixins: [AddTransactionMixin],
    props: {
        accountId: String,
        searchOptions: Object,
    },

    data() {
        return {
            selectedTab: 'table',
        };
    },

    watch: {
        $route() {
            this.loadTransactions();
        },
    },

    created() {
        this.loadTransactions();
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
        ...mapState(useAccountsStore, { findAccountById: 'account' }),
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
        ...mapActions(useRootStore, [stateActions.loadTransactions]),
        ...mapActions(useTransactionsStore, [
            transactionActions.addTransaction,
        ]),
        ...mapActions(useValuesStore, [valueActions.loadValues]),
    },

    components: {
        Transactions,
        CreateAccount,
        InvestmentValue,
    },
};
</script>
