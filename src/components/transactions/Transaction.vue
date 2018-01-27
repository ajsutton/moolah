<template>
    <v-list-tile @click.native.stop="editTransaction(transaction)" v-model="selected" ripple>
        <v-list-tile-action>
            <div>
                <div>{{dateDay}} {{dateMonth}}</div>
                <div class="grey--text text-xs-center body-1">{{dateYear}}</div>
            </div>
        </v-list-tile-action>
        <v-chip label :class="{'primary white--text': true, 'invisible': !due}" :aria-hidden="due" v-if="highlightOverdue">Due</v-chip>
        <v-list-tile-content>
            <v-list-tile-title>{{transactionTitle}}</v-list-tile-title>
            <v-list-tile-sub-title>{{ categoryName }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <monetary-amount :value="transaction.amount"></monetary-amount>
            <monetary-amount :value="transaction.balance" v-if="showBalance"></monetary-amount>
        </v-list-tile-action>
    </v-list-tile>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';
    import {formatDate as formatApiDate} from '../../api/apiFormats';
    import formatDate from 'date-fns/format';
    import parseDate from 'date-fns/parse';
    import isBefore from 'date-fns/is_before';

    export default {
        props: {
            transaction: {
                required: true,
            },
            showBalance: {
                type: Boolean,
                'default': true,
            },
            highlightOverdue: {
                type: Boolean,
                'default': false,
            }
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
                        if (this.account(this.transaction.accountId).type === 'earmark') {
                            return 'Earmark funds';
                        }
                        return this.transaction.payee || '\xa0';
                }
            },
            categoryName() {
                return this.transaction.categoryId ? this.getCategoryName(this.transaction.categoryId) : '\xa0';
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
            due() {
                return this.highlightOverdue && isBefore(this.parsedDate, Date.now());
            },
            ...mapGetters(['selectedTransaction']),
            ...mapGetters('categories', ['getCategoryName']),
            ...mapGetters('accounts', ['accountName', 'account']),
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
