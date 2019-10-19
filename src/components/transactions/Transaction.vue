<template>
    <v-list-item ripple :value="transaction">
        <v-list-item-action>
            <div>
                <div>{{ dateDay }} {{ dateMonth }}</div>
                <div class="grey--text text-xs-center body-1">
                    {{ dateYear }}
                </div>
            </div>
        </v-list-item-action>
        <v-chip
            label
            :class="{ 'primary white--text': true, invisible: !due }"
            :aria-hidden="due"
            v-if="highlightOverdue"
            >Due</v-chip
        >
        <v-list-item-content>
            <v-list-item-title>{{ transactionTitle }}</v-list-item-title>
            <v-list-item-subtitle>{{ categoryName }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
            <monetary-amount :value="transaction.amount"></monetary-amount>
            <monetary-amount
                :value="transaction.balance"
                v-if="showBalance"
            ></monetary-amount>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import client from '../../api/client';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import { actions as transactionActions } from '../../store/transactions/transactionStore';
import {
    actions as stateActions,
    mutations as stateMutations,
} from '../../store/store';
import { formatDate as formatApiDate } from '../../api/apiFormats';
import formatDate from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import { transactionTitle } from './transactionTitle';
import { isAfter, startOfDay } from 'date-fns';

export default {
    props: {
        transaction: {
            required: true,
        },
        showBalance: {
            type: Boolean,
            default: true,
        },
        highlightOverdue: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        transactionTitle() {
            return transactionTitle(
                this.transaction,
                this.accountName,
                this.earmarkName
            );
        },
        categoryName() {
            return this.transaction.categoryId
                ? this.getCategoryName(this.transaction.categoryId)
                : '\xa0';
        },
        selected() {
            return this.transaction === this.selectedTransaction;
        },
        parsedDate() {
            return new Date(this.transaction.date);
        },
        dateDay() {
            return formatDate(this.parsedDate, 'dd');
        },
        dateMonth() {
            return formatDate(this.parsedDate, 'MMM');
        },
        dateYear() {
            return formatDate(this.parsedDate, 'yyyy');
        },
        due() {
            return (
                this.highlightOverdue && isBefore(this.parsedDate, Date.now())
            );
        },
        ...mapGetters(['selectedTransaction']),
        ...mapGetters('categories', ['getCategoryName']),
        ...mapGetters('accounts', ['accountName']),
        ...mapGetters('earmarks', ['earmarkName']),
    },

    methods: {
        editTransaction(transaction) {
            this.$emit('selected', transaction);
        },
    },

    components: {
        MonetaryAmount,
    },
};
</script>

<style lang="scss" scoped>
.invisible {
    visibility: hidden !important;
}
</style>
