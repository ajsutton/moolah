<template>
    <div class="pl-2 pr-2">
        <p v-if="isEarmarkAccount" class="subheading">Earmark funds</p>
        <auto-complete-payee
            name="payee"
            label="Payee"
            v-model="payee"
            :rules="rules.payee"
            @blur="onBlur('payee')"
            v-else-if="!isOpeningBalance"
            ref="payee"
            @autofill="autofill"
        ></auto-complete-payee>

        <v-text-field
            name="amount"
            label="Amount"
            v-model="amount"
            prefix="$"
            :rules="rules.amount"
            @blur="onBlur('amount')"
            ref="amount"
        ></v-text-field>

        <date-picker-field v-model="date"></date-picker-field>

        <template v-if="!isEarmarkAccount">
            <category-selector v-model="category"></category-selector>

            <v-select
                label="Type"
                v-if="!isOpeningBalance"
                v-model="type"
                :items="validTransactionTypes"
            ></v-select>
            <wallet-selector
                :label="toAccountLabel"
                v-if="type === 'transfer'"
                :wallets="accounts"
                v-bind:value.sync="toAccountId"
                :excludeAccountId="accountId"
            ></wallet-selector>
        </template>

        <wallet-selector
            label="Earmark"
            v-bind:value.sync="earmark"
            :wallets="earmarks"
            :clearable="!isEarmarkAccount"
            v-if="showEarmarkSelector"
        ></wallet-selector>

        <recurrence v-if="scheduled" :transaction="transaction"></recurrence>

        <v-textarea
            name="notes"
            label="Notes"
            v-model="notes"
            :rules="rules.notes"
            @blur="onBlur('notes')"
        ></v-textarea>

        <wallet-selector
            v-if="scheduled && !isEarmarkAccount"
            label="Account"
            v-bind:value.sync="accountId"
            :wallets="accounts"
        ></wallet-selector>

        <div class="text-sm-right">
            <v-btn
                v-if="!isOpeningBalance"
                @click.native.prevent="deleteTransaction(transaction)"
                >Delete</v-btn
            >
            <v-btn v-if="scheduled" @click.native.prevent="pay(transaction)"
                >Pay</v-btn
            >
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import { actions as transactionActions } from '../../store/transactions/transactionStore';
import { rules, isValid } from '../validation';
import WalletSelector from '../wallets/WalletSelector.vue';
import CategorySelector from '../categories/CategorySelector.vue';
import AutoCompletePayee from './AutoCompletePayee.vue';
import Recurrence from './RecurranceControls.vue';
import DatePickerField from '../util/DatePickerField.vue';
import createTypeChangePatch from './changeType';
import { makeModelProperty, onBlur } from './modelProperty';
import parseMoney from '../util/parseMoney';
import formatMoney from '../util/formatMoney';

function typeMultiplier(transaction) {
    return transaction.type === 'expense' || transaction.type === 'transfer'
        ? -1
        : 1;
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
        isEarmarkAccount() {
            return this.account === undefined || this.account === null;
        },
        account() {
            return this.accountById(this.transaction.accountId);
        },
        ...mapGetters({
            transaction: 'selectedTransaction',
        }),
        ...mapGetters('accounts', { accountById: 'account' }),
        ...mapGetters('earmarks', ['hasEarmarks']),
        ...mapState('accounts', ['accounts']),
        ...mapState('earmarks', ['earmarks']),
        accountId: {
            get() {
                return this.transaction.accountId;
            },
            set(value) {
                const patch = { accountId: value };
                if (this.accountById(value).type === 'earmark') {
                    patch.type = 'income';
                    patch.payee = undefined;
                    patch.categoryId = undefined;
                    patch.toAccountId = undefined;
                }
                this.updateTransaction({
                    id: this.transaction.id,
                    patch,
                });
            },
        },
        earmark: {
            get() {
                return this.transaction.earmark;
            },
            set(value) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: { earmark: value },
                });
            },
        },
        validTransactionTypes() {
            const types = [
                { text: 'Expense', value: 'expense' },
                { text: 'Income', value: 'income' },
            ];
            if (this.accounts.length > 1) {
                types.push({ text: 'Transfer', value: 'transfer' });
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
                return this.transaction.date;
            },
            set: function (value) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: { date: value },
                });
            },
        },
        type: {
            get() {
                return this.transaction.type;
            },
            set(value) {
                if (value !== this.transaction.type) {
                    this.updateTransaction(
                        createTypeChangePatch(
                            this.transaction,
                            value,
                            this.accounts
                        )
                    );
                }
            },
        },
        toAccountId: {
            get() {
                return this.transaction.toAccountId;
            },
            set(value) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: {
                        type: 'transfer',
                        toAccountId: value,
                    },
                });
            },
        },
        category: makeModelProperty(
            'categoryId',
            (value) => value || '',
            (value) => (value === '' ? undefined : value)
        ),
        amount: makeModelProperty(
            'amount',
            (amount, transaction) =>
                formatMoney(typeMultiplier(transaction) * amount, false, true),
            (value, transaction) =>
                typeMultiplier(transaction) * parseMoney(value)
        ),
        showEarmarkSelector() {
            return (
                this.hasEarmarks && (!this.isEarmarkAccount || this.scheduled)
            );
        },
    },
    methods: {
        autofill(transaction) {
            this.updateTransaction({
                id: this.transaction.id,
                patch: {
                    payee: transaction.payee,
                    amount: transaction.amount,
                    categoryId: transaction.categoryId,
                    type: transaction.type,
                    toAccountId: transaction.toAccountId,
                },
            });
        },
        onBlur,
        ...mapActions({
            updateTransaction: transactionActions.updateTransaction,
            deleteTransaction: transactionActions.deleteTransaction,
        }),
        ...mapActions('scheduledTransactions', {
            pay: transactionActions.payTransaction,
        }),
        focus() {
            (this.$refs.payee || this.$refs.amount).focus();
        },
    },
    watch: {
        transactionId() {
            Object.keys(this.raw).forEach((key) => (this.raw[key] = undefined));
            this.focus();
        },
    },
    mounted() {
        this.focus();
    },
    components: {
        WalletSelector,
        CategorySelector,
        DatePickerField,
        Recurrence,
        AutoCompletePayee,
    },
};
</script>
