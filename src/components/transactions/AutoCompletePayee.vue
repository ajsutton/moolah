<template>
    <v-combobox
        ref="field"
        v-model="content"
        :label="label"
        :rules="rules"
        item-title="payee"
        return-object
        :items="uniqueTransactions"
        @blur="$emit('blur')"
        @update:modelValue="change"
    ></v-combobox>
</template>

<script>
import { mapState } from 'pinia';
import { useTransactionsStore } from '../../stores/transactions/transactionStore';
import { useRootStore } from '@/stores/root';

export default {
    props: {
        value: { default: '' },
        rules: { default: [] },
        name: { required: true },
        label: { required: true },
    },
    emits: ['update:modelValue', 'autofill'],
    data() {
        return {
            content: this.value,
        };
    },

    computed: {
        uniqueTransactions() {
            const payeeToTx = {};
            this.transactions.forEach(tx => {
                if (
                    tx !== this.selectedTransaction &&
                    payeeToTx[tx.payee] === undefined &&
                    tx.payee !== '' &&
                    tx.payee !== undefined &&
                    tx.payee !== null
                ) {
                    payeeToTx[tx.payee] = tx;
                }
            });
            return Object.values(payeeToTx);
        },
        ...mapState(useTransactionsStore, ['transactions']),
        ...mapState(useRootStore, ['selectedTransaction']),
    },

    methods: {
        focus() {
            this.$refs.field.focus();
        },

        select(transaction) {
            this.content = transaction.payee;
            this.$emit('autofill', transaction);
        },

        change(value) {
            if (typeof value === 'object') {
                this.select(value);
            } else {
                this.$emit('update:modelValue', value);
            }
        },
    },
};
</script>
