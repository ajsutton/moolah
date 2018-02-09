<template>
    <div>
        <savings-goal-notice :selectedAccount="selectedEarmark" v-if="selectedEarmark"></savings-goal-notice>
        <transactions :searchOptions="searchOptions" :title="earmarkName"></transactions>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import {actions as stateActions} from '../../store/store';
    import Transactions from '../transactions/Transactions.vue';
    import SavingsGoalNotice from './SavingsGoalNotice.vue';

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
            earmarkName() {
                return this.selectedEarmark ? this.selectedEarmark.name : '';
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
            SavingsGoalNotice,
        },
    };
</script>
