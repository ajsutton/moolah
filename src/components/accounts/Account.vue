<template>
    <transactions :searchOptions="searchOptions" :title="accountName">
        <template v-if="selectedAccount" slot="buttons">
            <create-account :account="selectedAccount"></create-account>
            <v-btn icon @click.native.stop="addTransaction">
                <v-icon>add</v-icon>
            </v-btn>
        </template>
    </transactions>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import {
    actions as stateActions,
    mutations as stateMutations
} from "../../store/store";
import { actions as transactionActions } from "../../store/transactions/transactionStore";
import Transactions from "../transactions/Transactions.vue";
import CreateAccount from "../accounts/CreateAccount.vue";
import AddTransactionMixin from "../util/AddTransactionMixin";

export default {
    props: {
        accountId: String,
        searchOptions: Object
    },

    mixins: [AddTransactionMixin],

    created() {
        this.loadTransactions();
    },

    watch: {
        $route() {
            this.loadTransactions();
        }
    },

    computed: {
        selectedAccount() {
            return this.findAccountById(this.accountId);
        },
        accountName() {
            return this.selectedAccount ? this.selectedAccount.name : "";
        },
        ...mapGetters("accounts", { findAccountById: "account" })
    },

    methods: {
        async loadTransactions() {
            await this[stateActions.loadTransactions](this.searchOptions);
        },
        addTransaction() {
            this[transactionActions.addTransaction]({
                accountId: this.accountId
            });
        },
        ...mapActions([stateActions.loadTransactions]),
        ...mapActions("transactions", [transactionActions.addTransaction])
    },

    components: {
        Transactions,
        CreateAccount
    }
};
</script>
