<template>
    <v-dialog v-model="dialog" persistent max-width="500px">
        <template #activator="{ on }">
            <v-btn text icon :color="isFiltered ? 'primary' : null" v-on="on">
                <v-icon>search</v-icon>
            </v-btn>
        </template>

        <v-card>
            <v-card-title>
                <span class="text-h5">Show Transactions</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <date-picker-field
                                v-model="from"
                                label="From"
                                :optional="true"
                            ></date-picker-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <date-picker-field
                                v-model="to"
                                label="To"
                                :optional="true"
                            ></date-picker-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <category-selector
                                v-model="categories"
                                multiple
                                label="Categories"
                            ></category-selector>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click.native="close">Close</v-btn>
                <v-btn text color="primary" @click.native="search"
                    >Search</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import DatePickerField from '../util/DatePickerField.vue';
import CategorySelector from '../categories/CategorySelector.vue';
import { mapState, mapActions } from 'pinia';
import {
    useTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';

export default {
    data() {
        return {
            from: undefined,
            to: undefined,
            categories: [],
            dialog: false,
        };
    },
    computed: {
        ...mapState(useTransactionsStore, ['searchOptions', 'isFiltered']),
    },
    watch: {
        searchOptions: {
            handler: 'reset',
            deep: true,
        },
    },
    created() {
        this.reset();
    },
    methods: {
        reset() {
            this.from = this.searchOptions.from;
            this.to = this.searchOptions.to;
            this.categories = this.searchOptions.category || [];
        },
        close() {
            this.dialog = false;
            this.reset();
        },
        search() {
            this.$router.push({
                path: this.$route.path,
                query: {
                    from: this.from,
                    to: this.to,
                    category: this.categories,
                },
            });
            this.dialog = false;
        },
        ...mapActions(useTransactionsStore, [
            transactionActions.loadTransactions,
        ]),
    },
    components: {
        DatePickerField,
        CategorySelector,
    },
};
</script>
