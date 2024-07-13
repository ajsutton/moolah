<template>
    <v-alert v-model="active" type="info" closable>{{ message }}</v-alert>
</template>
<script>
import { mapState } from 'pinia';
import { useTransactionsStore } from '../../stores/transactions/transactionStore';
import { useCategoryStore } from '../../stores/categoryStore';

export default {
    computed: {
        active: {
            get() {
                return this.isFiltered;
            },
            set(value) {
                if (!value) {
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            from: undefined,
                            to: undefined,
                            category: undefined,
                            payee: undefined,
                        },
                    });
                }
            },
        },
        message() {
            let message = 'Showing transactions';
            if (
                this.searchOptions.from !== undefined &&
                this.searchOptions.to !== undefined
            ) {
                message += ` between ${this.searchOptions.from} and ${this.searchOptions.to}`;
            } else if (this.searchOptions.from !== undefined) {
                message += ` on or after ${this.searchOptions.from}`;
            } else if (this.searchOptions.to !== undefined) {
                message += ` on or before ${this.searchOptions.to}`;
            }

            if (
                this.searchOptions.category !== undefined &&
                this.searchOptions.category.length > 0
            ) {
                if (this.searchOptions.category.length < 3) {
                    const categoryList = this.searchOptions.category
                        .map(this.getCategoryName)
                        .join(', ');
                    message += ` categorised as ${categoryList}`;
                } else {
                    message += ` in ${this.searchOptions.category.length} categories`;
                }
            }
            if (
                this.searchOptions.payee !== undefined &&
                this.searchOptions.payee !== ''
            ) {
                message += ` with payee containing ${this.searchOptions.payee}`;
            }
            return message;
        },
        ...mapState(useTransactionsStore, ['searchOptions', 'isFiltered']),
        ...mapState(useCategoryStore, ['getCategoryName']),
    },
};
</script>
