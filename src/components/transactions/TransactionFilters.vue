<template>
    <v-dialog v-model="dialog" persistent max-width="500px">
        <v-btn slot="activator" flat icon :color="filtersActive ? 'primary' : null"><v-icon>search</v-icon></v-btn>

        <v-card>
            <v-card-title>
                <span class="headline">Show Transactions</span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6>
                            <date-picker-field label="From" v-model="from" :optional="true"></date-picker-field>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <date-picker-field label="To" v-model="to" :optional="true"></date-picker-field>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat @click.native="close">Close</v-btn>
                <v-btn flat @click.native="search" color="primary">Search</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import DatePickerField from '../util/DatePickerField.vue';
    import {mapState, mapActions} from 'vuex';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    export default {
        data() {
            return {
                from: undefined,
                to: undefined,
                dialog: false,
            };
        },
        computed: {
            filtersActive() {
                return this.from !== undefined || this.to !== undefined;
            },
            ...mapState('transactions', ['searchOptions']),
        },
        watch: {
            'searchOptions': {
                handler: 'reset',
                deep: true
            }
        },
        methods: {
            reset() {
                this.from = this.searchOptions.from;
                this.to = this.searchOptions.to;
            },
            close() {
                this.dialog = false;
                this.reset();
            },
            async search() {
                await this[transactionActions.loadTransactions](Object.assign(
                    {},
                    this.searchOptions,
                    {
                        from: this.from,
                        to: this.to
                    }
                ));
                this.dialog = false;
            },
            ...mapActions('transactions', [transactionActions.loadTransactions]),
        },
        components: {
            DatePickerField
        }
    };
</script>