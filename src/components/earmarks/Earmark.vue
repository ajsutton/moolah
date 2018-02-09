<template>
    <transactions :searchOptions="searchOptions" title="Earmarked Transactions"></transactions>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import {actions as stateActions} from '../../store/store';
    import Transactions from '../transactions/Transactions.vue';

    export default {
        props: {
            earmarkId: String,
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
            selectedEarmark() {
                return this.findEarmarkById(this.earmarkId);
            },
            ...mapGetters('earmarks', {findEarmarkById: 'earmark'}),
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
