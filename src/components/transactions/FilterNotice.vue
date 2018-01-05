<template>
        <v-alert type="info" v-model="active" dismissible>{{message}}</v-alert>
</template>
<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';

    export default {
        computed: {
            active: {
                get() {
                    return this.isFiltered;
                },
                set(value) {
                    if (!value) {
                        this[transactionActions.loadTransactions]({accountId: this.searchOptions.accountId});
                    }
                }
            },
            message() {
                let message = 'Showing transactions';
                if (this.searchOptions.from !== undefined && this.searchOptions.to !== undefined) {
                    message += ` between ${this.searchOptions.from} and ${this.searchOptions.to}`
                } else if (this.searchOptions.from !== undefined) {
                    message += ` on or after ${this.searchOptions.from}`;
                } else if (this.searchOptions.to !== undefined) {
                    message += ` on or before ${this.searchOptions.to}`;
                }

                if (this.searchOptions.category !== undefined && this.searchOptions.category.length > 0) {
                    if (this.searchOptions.category.length < 3) {
                        const categoryList = this.searchOptions.category
                            .map(this.getCategoryName)
                            .join(', ');
                        message += ` categorised as ${categoryList}`;
                    } else {
                        message += ` in ${this.searchOptions.category.length} categories`;
                    }
                }
                return message;
            },
            ...mapGetters('transactions', ['isFiltered']),
            ...mapState('transactions', ['searchOptions']),
            ...mapGetters('categories', ['getCategoryName'])
        },
        methods: {
            ...mapActions('transactions', [transactionActions.loadTransactions]),
        }
    };
</script>