<template>
    <transactions :account="selectedAccount" :searchOptions="searchOptions"></transactions>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';
    import Transactions from '../transactions/Transactions.vue';

    export default {
        props: {
            accountId: String,
            searchOptions: Object,
        },

        created() {
            this.loadTransactions();
        },

        watch: {
            '$route'() {
                this.loadTransactions();
            },
        },

        computed: {
            selectedAccount() {
                return this.findAccountById(this.accountId);
            },
            ...mapGetters('accounts', {findAccountById: 'account'}),
        },

        methods: {
            async loadTransactions() {
                await this[stateActions.loadTransactions](this.searchOptions);
            },
            ...mapActions([stateActions.loadTransactions]),
        },

        components: {
            Transactions,
        },
    };
</script>
