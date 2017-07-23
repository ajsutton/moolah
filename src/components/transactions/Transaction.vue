<template>
    <v-list-tile @click.native.stop="editTransaction(transaction)" v-model="selected" ripple>
        <v-list-tile-action>
            <div>
                <div>{{dateDay}} {{dateMonth}}</div>
                <div class="grey--text text-xs-center body-1">{{dateYear}}</div>
            </div>
        </v-list-tile-action>
        <v-list-tile-content>
            <v-list-tile-title>{{transactionTitle}}</v-list-tile-title>
            <v-list-tile-sub-title>{{ categoryName }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <monetary-amount :value="transaction.amount"></monetary-amount>
            <monetary-amount :value="transaction.balance"></monetary-amount>
        </v-list-tile-action>
    </v-list-tile>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';
    import formatDate from 'date-fns/format'
    import parseDate from 'date-fns/parse'

    export default {
        props: ['transaction'],
        data() {
            return {};
        },
        computed: {
            transactionTitle() {
                switch (this.transaction.type) {
                    case 'openingBalance':
                        return 'Opening Balance';
                    case 'transfer':
                        const accountName = this.accountName(this.transaction.toAccountId);
                        const direction = this.transaction.amount >= 0 ? 'from' : 'to';
                        const transferDescription = `Transfer ${direction} ${accountName}`;
                        return this.transaction.payee ? `${this.transaction.payee} (${transferDescription})` : transferDescription;
                    default:
                        return this.transaction.payee;
                }
            },
            categoryName() {
                return this.transaction.categoryId ? this.getCategoryName(this.transaction.categoryId) : '';
            },
            selected() {
                return this.transaction === this.selectedTransaction;
            },
            parsedDate() {
                return parseDate(this.transaction.date);
            },
            dateDay() {
                return formatDate(this.parsedDate, 'DD');
            },
            dateMonth() {
                return formatDate(this.parsedDate, 'MMM');
            },
            dateYear() {
                return formatDate(this.parsedDate, 'YYYY');
            },
            ...mapGetters('transactions', ['selectedTransaction']),
            ...mapGetters('categories', ['getCategoryName']),
            ...mapGetters('accounts', ['accountName']),
        },

        methods: {
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, transaction.id);
            },
        },

        components: {
            MonetaryAmount,
        }
    };
</script>
