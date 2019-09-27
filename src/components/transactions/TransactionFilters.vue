<template>
    <v-dialog v-model="dialog" persistent max-width="500px">
        <template v-slot:activator="{ on }">
            <v-btn v-on="on" text icon :color="isFiltered ? 'primary' : null">
                <v-icon>search</v-icon>
            </v-btn>
        </template>

        <v-card>
            <v-card-title>
                <span class="headline">Show Transactions</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6>
                            <date-picker-field
                                label="From"
                                v-model="from"
                                :optional="true"
                            ></date-picker-field>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <date-picker-field
                                label="To"
                                v-model="to"
                                :optional="true"
                            ></date-picker-field>
                        </v-flex>
                    </v-layout>
                    <v-layout wrap>
                        <v-flex xs12>
                            <category-selector
                                multiple
                                v-model="categories"
                                label="Categories"
                            ></category-selector>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click.native="close">Close</v-btn>
                <v-btn text @click.native="search" color="primary"
                    >Search</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import DatePickerField from '../util/DatePickerField.vue';
import CategorySelector from '../categories/CategorySelector.vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import { actions as transactionActions } from '../../store/transactions/transactionStore';

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
        ...mapState('transactions', ['searchOptions']),
        ...mapGetters('transactions', ['isFiltered']),
    },
    created() {
        this.reset();
    },
    watch: {
        searchOptions: {
            handler: 'reset',
            deep: true,
        },
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
        ...mapActions('transactions', [transactionActions.loadTransactions]),
    },
    components: {
        DatePickerField,
        CategorySelector,
    },
};
</script>
