<template>
    <v-card class="upcoming-transactions">
        <v-app-bar flat class="white">
            <v-toolbar-title class="text-body-2 grey--text"
                >Upcoming Transactions</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-btn icon :disabled="noEarmarks" @click.native.stop="addEarmark">
                <v-icon>mdi-bookmark-outline</v-icon>
            </v-btn>
            <v-btn
                icon
                :disabled="noAccounts"
                @click.native.stop="addTransaction"
            >
                <v-icon>add</v-icon>
            </v-btn>
        </v-app-bar>
        <v-progress-linear
            v-if="loading"
            :indeterminate="true"
        ></v-progress-linear>
        <v-list two-line>
            <v-list-item-group
                v-model="itemGroupSelectedTransaction"
                color="primary"
            >
                <template v-for="transaction in transactionsToDisplay">
                    <transaction
                        :key="transaction.id"
                        :transaction="transaction"
                        :show-balance="false"
                        highlight-overdue
                    >
                    </transaction>
                    <v-divider></v-divider>
                </template>
            </v-list-item-group>
        </v-list>
    </v-card>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import client from '../../api/client';
import Transaction from './Transaction.vue';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import CreateAccount from '../accounts/CreateAccount.vue';
import { actions as transactionActions } from '../../store/transactions/transactionStore';
import {
    actions as stateActions,
    mutations as stateMutations,
} from '../../store/store';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import AddTransactionMixin from '../util/AddTransactionMixin';
import { parseDate } from '../../api/apiFormats';

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
                return this.highlightedTransaction;
            },
            set(transaction) {
                this.editTransaction(transaction);
            },
        },
        ...mapGetters(['selectedTransaction']),
        ...mapState('scheduledTransactions', ['transactions', 'loading']),
        ...mapState('accounts', ['accounts']),
        ...mapState('earmarks', ['earmarks']),
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
                this.$store.commit(stateMutations.selectTransaction, {
                    id: transaction.id,
                    scheduled: true,
                });
            } else {
                this.$store.commit(stateMutations.selectTransaction, null);
            }
        },
        ...mapActions([stateActions.showUpcoming]),
        ...mapActions('scheduledTransactions', [
            transactionActions.addTransaction,
        ]),
    },

    components: {
        MonetaryAmount,
        Transaction,
        CreateAccount,
    },
};
</script>

<style lang="scss">
.upcoming-transactions {
    overflow-y: auto;
}
</style>
