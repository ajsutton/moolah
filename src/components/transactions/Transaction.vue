<template>
    <v-list-item ripple :value="transaction">
        <v-list-item-action>
            <div>
                <div>{{ dateDay }} {{ dateMonth }}</div>
                <div class="grey--text text-sm-center text-body-1">
                    {{ dateYear }}
                </div>
            </div>
        </v-list-item-action>
        <v-chip
            v-if="highlightOverdue"
            label
            :class="{ 'primary white--text': true, invisible: !due }"
            :aria-hidden="due"
            >Due</v-chip
        >
        <v-list-item-content>
            <v-list-item-title>{{ transactionTitle }}</v-list-item-title>
            <v-list-item-subtitle>{{ categoryName }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
            <monetary-amount :value="transaction.amount"></monetary-amount>
            <monetary-amount
                v-if="showBalance"
                :value="transaction.balance"
            ></monetary-amount>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
import { mapGetters } from 'vuex';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import { parseDate } from '../../api/apiFormats';
import formatDate from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import { transactionTitle } from './transactionTitle';

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
            ``;
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
            return parseDate(this.transaction.date);
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
                this.highlightOverdue &&
                isBefore(startOfDay(this.parsedDate), new Date())
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
