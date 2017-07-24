<template>
    <div class="pl-2 pr-2">
        <v-select
                label="Type"
                v-if="!isOpeningBalance"
                v-model="type"
                :items="validTransactionTypes"
        ></v-select>
        <account-selector :label="toAccountLabel" v-if="type === 'transfer'" v-bind:value.sync="toAccountId" :excludeAccountId="accountId"></account-selector>

        <v-menu
                lazy
                :close-on-content-click="true"
                v-model="dateMenu"
                offset-y
                full-width
                :nudge-right="40"
                max-width="290px"
                transition="scale-transition"
        >
            <v-text-field
                    slot="activator"
                    label="Date"
                    v-model="date"
                    readonly
            ></v-text-field>
            <v-date-picker v-model="date" no-title scrollable actions>
            </v-date-picker>
        </v-menu>

        <v-text-field name="payee" label="Payee" v-model="payee" :rules="rules.payee" @blur="onBlur('payee')" v-if="!isOpeningBalance"></v-text-field>
        <v-text-field name="amount" label="Amount" v-model="amount" prefix="$" :rules="rules.amount" @blur="onBlur('amount')"></v-text-field>

        <category-selector v-model="category"></category-selector>

        <recurrence v-if="scheduled" :transaction="transaction"></recurrence>

        <v-text-field name="notes" label="Notes" v-model="notes" :rules="rules.notes" @blur="onBlur('notes')" multiLine></v-text-field>

        <div class="text-xs-right">
            <v-btn v-if="!isOpeningBalance" @click.native.prevent="deleteTransaction(transaction)">Delete</v-btn>
            <v-btn v-if="scheduled">Pay</v-btn>
        </div>
    </div>
</template>
<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {rules, isValid} from '../validation';
    import AccountSelector from '../accounts/AccountSelector.vue';
    import createTypeChangePatch from './changeType';
    import CategorySelector from '../categories/CategorySelector.vue';
    import Recurrence from './RecurranceControls.vue';
    import {makeModelProperty, onBlur} from './modelProperty';

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
                rules
            };
        },
        computed: {
            transactionId() {
                return this.transaction.id;
            },
            isOpeningBalance() {
                return this.transaction && this.transaction.type === 'openingBalance';
            },
            toAccountLabel() {
                return this.transaction.amount < 0 ? 'To Account' : 'From Account';
            },
            ...mapGetters('transactions', {
                transaction: 'selectedTransaction',
            }),
            ...mapState('accounts', {
                accounts: state => state.accounts,
            }),
            accountId() {
                return this.transaction ? this.transaction.accountId : undefined;
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
                get() {
                    return this.transaction ? this.transaction.date : undefined;
                },
                set(value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {date: value},
                    });
                },
            },
            type: {
                get() {
                    return this.transaction ? this.transaction.type : undefined;
                },
                set(value) {
                    if (value !== this.transaction.type) {
                        this.updateTransaction(createTypeChangePatch(this.transaction, value, this.accounts));
                    }
                },
            },
            toAccountId: {
                get() {
                    return this.transaction ? this.transaction.toAccountId : undefined;
                },
                set(value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {
                            type: 'transfer',
                            toAccountId: value
                        }
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
            ...mapActions('transactions', {
                updateTransaction: transactionActions.updateTransaction,
                deleteTransaction: transactionActions.deleteTransaction,
            }),
        },
        watch: {
            transactionId() {
                Object.keys(this.raw).forEach(key => this.raw[key] = undefined);
            },
        },
        components: {
            AccountSelector,
            CategorySelector,
            Recurrence,
        },
    };
</script>
