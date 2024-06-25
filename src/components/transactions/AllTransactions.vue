<template>
    <transactions
        :search-options="searchOptions"
        title="All Transactions"
    ></transactions>
</template>

<script>
import { mapActions } from 'pinia';
import { useRootStore, actions as stateActions } from '../../stores/root';
import Transactions from '../transactions/Transactions.vue';

export default {
    props: {
        searchOptions: Object,
    },

    watch: {
        $route() {
            this.loadTransactions();
        },
    },

    created() {
        this.loadTransactions();
    },

    methods: {
        async loadTransactions() {
            await this[stateActions.loadTransactions](this.searchOptions);
        },
        ...mapActions(useRootStore, [stateActions.loadTransactions]),
    },

    components: {
        Transactions,
    },
};
</script>
