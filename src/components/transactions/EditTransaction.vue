<template>
    <div class="pl-2 pr-2">
        <p v-if="isEarmarkAccount" class="subheading">Earmark funds</p>
        <auto-complete-payee
            v-else-if="!isOpeningBalance"
            ref="payee"
            v-model="payee"
            name="payee"
            label="Payee"
            :rules="rules.payee"
            @blur="onBlur('payee')"
            @autofill="autofill"
        ></auto-complete-payee>

        <v-text-field
            ref="amount"
            v-model="amount"
            name="amount"
            label="Amount"
            prefix="$"
            :rules="rules.amount"
            @blur="onBlur('amount')"
        ></v-text-field>

        <date-picker-field v-model="date"></date-picker-field>

        <template v-if="!isEarmarkAccount">
            <category-selector v-model="category"></category-selector>

            <v-select
                v-if="!isOpeningBalance"
                v-model="type"
                label="Type"
                :items="validTransactionTypes"
            ></v-select>
            <wallet-selector
                v-if="type === 'transfer'"
                :label="toAccountLabel"
                :wallets="accounts"
                v-model:value="toAccountId"
                :exclude-account-id="accountId"
            ></wallet-selector>
        </template>

        <wallet-selector
            v-if="showEarmarkSelector"
            label="Earmark"
            v-model:value="earmark"
            :wallets="earmarks"
            :clearable="!isEarmarkAccount"
        ></wallet-selector>

        <recurrence v-if="scheduled" :transaction="transaction"></recurrence>

        <v-textarea
            v-model="notes"
            name="notes"
            label="Notes"
            :rules="rules.notes"
            @blur="onBlur('notes')"
        ></v-textarea>

        <wallet-selector
            v-if="scheduled && !isEarmarkAccount"
            label="Account"
            v-model:value="accountId"
            :wallets="accounts"
        ></wallet-selector>

        <div class="text-sm-right">
            <v-btn
                v-if="!isOpeningBalance"
                @click.prevent="deleteTransaction(transaction)"
                >Delete</v-btn
            >
            <v-btn v-if="scheduled" @click.prevent="pay(transaction)"
                >Pay</v-btn
            >
        </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import {
    actions as transactionActions,
    useScheduledTransactionsStore,
} from '../../stores/transactions/transactionStore';
import { useAccountsStore } from '../../stores/accountsStore';
import { useEarmarksStore } from '../../stores/earmarksStore';
import { rules } from '../validation';
import WalletSelector from '../wallets/WalletSelector.vue';
import CategorySelector from '../categories/CategorySelector.vue';
import AutoCompletePayee from './AutoCompletePayee.vue';
import Recurrence from './RecurranceControls.vue';
import DatePickerField from '../util/DatePickerField.vue';
import createTypeChangePatch from './changeType';
import { makeModelProperty, onBlur } from './modelProperty';
import parseMoney from '../util/parseMoney';
import formatMoney from '../util/formatMoney';
import { useRootStore } from '../../stores/root';

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
        ...mapState(useRootStore, {
            transaction: 'selectedTransaction',
        }),
        ...mapState(useAccountsStore, { accountById: 'account' }),
        ...mapState(useEarmarksStore, ['hasEarmarks']),
        ...mapState(useAccountsStore, ['accounts']),
        ...mapState(useEarmarksStore, ['earmarks']),
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
                { title: 'Expense', value: 'expense' },
                { title: 'Income', value: 'income' },
            ];
            if (this.accounts.length > 1) {
                types.push({ title: 'Transfer', value: 'transfer' });
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
            value => value || '',
            value => (value === '' ? undefined : value)
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
        ...mapActions(useRootStore, {
            updateTransaction: transactionActions.updateTransaction,
            deleteTransaction: transactionActions.deleteTransaction,
        }),
        ...mapActions(useScheduledTransactionsStore, {
            pay: transactionActions.payTransaction,
        }),
        focus() {
            (this.$refs.payee || this.$refs.amount).focus();
        },
    },
    watch: {
        transactionId() {
            Object.keys(this.raw).forEach(key => (this.raw[key] = undefined));
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
