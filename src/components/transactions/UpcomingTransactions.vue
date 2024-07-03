<template>
    <v-card class="upcoming-transactions">
        <v-toolbar flat>
            <v-toolbar-title>Upcoming Transactions</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon :disabled="noEarmarks" @click.stop="addEarmark">
                <v-icon :icon="IconBookmarkOutline"></v-icon>
            </v-btn>
            <v-btn icon :disabled="noAccounts" @click.stop="addTransaction">
                <v-icon :icon="IconAdd"></v-icon>
            </v-btn>
        </v-toolbar>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
        ></v-progress-linear>
        <v-list
            lines="two"
            :selectable="true"
            :selected="itemGroupSelectedTransaction"
            color="primary"
        >
            <template
                v-for="transaction in transactionsToDisplay"
                :key="transaction.id"
            >
                <transaction
                    :transaction="transaction"
                    :show-balance="false"
                    highlight-overdue
                    @selected="editTransaction"
                >
                </transaction>
                <v-divider></v-divider>
            </template>
        </v-list>
    </v-card>
</template>

<script setup>
import IconAdd from '~icons/mdi/add';
import IconBookmarkOutline from '~icons/mdi/bookmarkOutline';
</script>

<script>
import { mapState, mapActions } from 'pinia';
import {
    useScheduledTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';
import { useAccountsStore } from '../../stores/accountsStore';
import Transaction from './Transaction.vue';
import {
    useRootStore,
    actions as stateActions,
    mutations as stateMutations,
} from '../../stores/root';
import { differenceInCalendarDays } from 'date-fns';
import AddTransactionMixin from '../util/AddTransactionMixin';
import { parseDate } from '../../api/apiFormats';
import { useEarmarksStore } from '../../stores/earmarksStore';

export default {
    mixins: [AddTransactionMixin],
    props: {
        height: {
            default: '',
        },
        shortTerm: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            highlightedTransaction: undefined,
        };
    },
    computed: {
        noAccounts() {
            return this.accounts.length === 0;
        },
        noEarmarks() {
            return this.earmarks.length === 0;
        },
        transactionsToDisplay() {
            return this.shortTerm
                ? this.transactions.filter(
                      transaction =>
                          differenceInCalendarDays(
                              parseDate(transaction.date),
                              new Date()
                          ) < 14
                  )
                : this.transactions;
        },
        itemGroupSelectedTransaction: {
            get() {
                return [this.highlightedTransaction];
            },
            set(transaction) {
                this.editTransaction(transaction);
            },
        },
        ...mapState(useRootStore, ['selectedTransaction']),
        ...mapState(useScheduledTransactionsStore, ['transactions', 'loading']),
        ...mapState(useAccountsStore, ['accounts']),
        ...mapState(useEarmarksStore, ['earmarks']),
    },

    methods: {
        addTransaction() {
            this[transactionActions.addTransaction]({
                recurEvery: null,
                recurPeriod: 'ONCE',
            });
        },
        addEarmark() {
            this[transactionActions.addTransaction]({
                earmark: this.earmarks[0].id,
                accountId: undefined,
                type: 'income',
                recurEvery: null,
                recurPeriod: 'ONCE',
            });
        },
        editTransaction(transaction) {
            if (transaction) {
                this[stateMutations.selectTransaction]({
                    id: transaction.id,
                    scheduled: true,
                });
            } else {
                this[stateMutations.selectTransaction](null);
            }
        },
        ...mapActions(useRootStore, [
            stateActions.showUpcoming,
            stateMutations.selectTransaction,
        ]),
        ...mapActions(useScheduledTransactionsStore, [
            transactionActions.addTransaction,
        ]),
    },

    components: {
        Transaction,
    },
};
</script>

<style lang="scss">
.upcoming-transactions {
    overflow-y: auto;
}
</style>
