<template>
    <v-combobox
        ref="field"
        :label="label"
        :rules="rules"
        v-model="content"
        item-text="payee"
        return-object
        :items="transactions"
        @blur="$emit('blur')"
        @change="change"
    ></v-combobox>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

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
        ...mapState('transactions', ['transactions']),
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
