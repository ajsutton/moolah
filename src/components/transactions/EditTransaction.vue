<template>
    <div class="pl-2 pr-2">
        <v-text-field name="payee" label="Payee" v-model="payee" :rules="rules.payee" @blur="onBlur('payee')" v-if="!isOpeningBalance" ref="payee"></v-text-field>
        <v-text-field name="amount" label="Amount" v-model="amount" prefix="$" :rules="rules.amount" @blur="onBlur('amount')"></v-text-field>

        <date-picker-field v-model="date"></date-picker-field>

        <category-selector v-model="category"></category-selector>

        <v-select
                label="Type"
                v-if="!isOpeningBalance"
                v-model="type"
                :items="validTransactionTypes"
        ></v-select>
        <account-selector :label="toAccountLabel" v-if="type === 'transfer'" v-bind:value.sync="toAccountId" :excludeAccountId="accountId"></account-selector>

        <recurrence v-if="scheduled" :transaction="transaction"></recurrence>

        <v-text-field name="notes" label="Notes" v-model="notes" :rules="rules.notes" @blur="onBlur('notes')" multiLine></v-text-field>

        <account-selector v-if="scheduled" label="Account" v-bind:value.sync="accountId"></account-selector>

        <div class="text-xs-right">
            <v-btn v-if="!isOpeningBalance" @click.native.prevent="deleteTransaction(transaction)">Delete</v-btn>
            <v-btn v-if="scheduled" @click.native.prevent="pay(transaction)">Pay</v-btn>
        </div>
    </div>
</template>
<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {rules, isValid} from '../validation';
    import AccountSelector from '../accounts/AccountSelector.vue';
    import CategorySelector from '../categories/CategorySelector.vue';
    import Recurrence from './RecurranceControls.vue';
    import DatePickerField from '../util/DatePickerField.vue';
    import createTypeChangePatch from './changeType';
    import {makeModelProperty, onBlur} from './modelProperty';
    import debounce from 'debounce';

    function typeMultiplier(transaction) {
        return transaction.type === 'expense' ? -1 : 1;
    }

    export default {
        data() {
            return {
                dateMenu: false,
                raw: {
                    payee: undefined,
                    amount: undefined,
                    note: undefined,
                    categoryId: undefined,
                },
                rules,
            };
        },
        computed: {
            transactionId() {
                return this.transaction.id;
            },
            isOpeningBalance() {
                return this.transaction.type === 'openingBalance';
            },
            toAccountLabel() {
                return this.transaction.amount < 0 ? 'To Account' : 'From Account';
            },
            ...mapGetters({
                transaction: 'selectedTransaction',
            }),
            ...mapState('accounts', {
                accounts: state => state.accounts,
            }),
            accountId: {
                get () {
                    return this.transaction.accountId;
                },
                set (value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {accountId: value},
                    });
                },
            },
            validTransactionTypes() {
                const types = [{text: 'Expense', value: 'expense'}, {text: 'Income', value: 'income'}];
                if (this.accounts.length > 1) {
                    types.push({text: 'Transfer', value: 'transfer'});
                }
                return types;
            },
            scheduled() {
                return this.transaction.recurPeriod !== undefined;
            },
            payee: makeModelProperty('payee'),
            notes: makeModelProperty('notes'),
            date: {
                get () {
                    return this.transaction.date;
                },
                set: debounce(function(value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {date: value},
                    });
                }, 1000),
            },
            type: {
                get () {
                    return this.transaction.type;
                },
                set (value) {
                    if (value !== this.transaction.type) {
                        this.updateTransaction(createTypeChangePatch(this.transaction, value, this.accounts));
                    }
                },
            },
            toAccountId: {
                get () {
                    return this.transaction.toAccountId;
                },
                set (value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {
                            type: 'transfer',
                            toAccountId: value,
                        },
                    });
                },
            },
            category: makeModelProperty('categoryId'),
            amount: makeModelProperty('amount',
                (amount, transaction) => (typeMultiplier(transaction) * amount / 100).toFixed(2),
                (value, transaction) => typeMultiplier(transaction) * Math.round(value * 100)),

        },
        methods: {
            onBlur,
            ...mapActions({
                updateTransaction: transactionActions.updateTransaction,
                deleteTransaction: transactionActions.deleteTransaction,
            }),
            ...mapActions('scheduledTransactions', {
                pay: transactionActions.payTransaction,
            })
        },
        watch: {
            transactionId() {
                Object.keys(this.raw).forEach(key => this.raw[key] = undefined);
                this.$refs.payee.focus();
            },
        },
        mounted() {
            this.$refs.payee.focus();
        },
        components: {
            AccountSelector,
            CategorySelector,
            DatePickerField,
            Recurrence,
        },
    };
</script>
