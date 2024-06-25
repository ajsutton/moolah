<template>
    <v-combobox
        ref="field"
        v-model="content"
        :label="label"
        :rules="rules"
        item-text="payee"
        return-object
        :items="transactions"
        @blur="$emit('blur')"
        @change="change"
    ></v-combobox>
</template>

<script>
import { mapState } from 'pinia';
import { useTransactionsStore } from '../../stores/transactions/transactionStore';

export default {
    props: {
        value: { default: '' },
        rules: { default: [] },
        name: { required: true },
        label: { required: true },
    },
    data() {
        return {
            content: this.value,
        };
    },

    computed: {
        ...mapState(useTransactionsStore, ['transactions']),
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
                this.$emit('input', value);
            }
        },
    },
};
</script>
