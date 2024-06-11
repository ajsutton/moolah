<template>
    <transactions
        :search-options="searchOptions"
        title="All Transactions"
    ></transactions>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import {
    actions as stateActions,
    mutations as stateMutations,
} from '../../store/store';
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
        ...mapActions([stateActions.loadTransactions]),
    },

    components: {
        Transactions,
    },
};
</script>
