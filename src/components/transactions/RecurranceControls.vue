<template>
    <div>
        <v-switch
            v-model="repeating"
            class="tight-input-group"
            label="Repeat"
            hide-details
        ></v-switch>
        <v-row v-if="repeating">
            <v-col cols="4">
                <v-text-field
                    v-model="recurEvery"
                    label="Every"
                    type="number"
                    :rules="rules.recurEvery"
                    @blur="onBlur('recurEvery')"
                ></v-text-field>
            </v-col>
            <v-col cols="8">
                <v-select
                    v-model="recurPeriod"
                    single-line
                    :items="periodItems"
                ></v-select>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapActions } from 'pinia';
import {
    useScheduledTransactionsStore,
    actions as transactionActions,
} from '../../stores/transactions/transactionStore';
import { rules } from '../validation';
import { makeModelProperty, onBlur } from './modelProperty';

export default {
    props: ['transaction'],
    data() {
        return {
            periodItems: [
                { text: 'Days', value: 'DAY' },
                { text: 'Weeks', value: 'WEEK' },
                { text: 'Months', value: 'MONTH' },
                { text: 'Years', value: 'YEAR' },
            ],
            raw: {
                recurPeriod: undefined,
                recurEvery: undefined,
            },
            rules,
        };
    },
    computed: {
        transactionId() {
            return this.transaction.id;
        },
        repeating: {
            get() {
                return this.transaction.recurPeriod !== 'ONCE';
            },
            set(value) {
                if (value) {
                    this.updateTransaction({
                        id: this.transactionId,
                        patch: {
                            recurPeriod: this.raw.recurPeriod || 'MONTH',
                            recurEvery: this.raw.recurEvery || 1,
                        },
                    });
                } else {
                    this.raw.recurPeriod = this.transaction.recurPeriod;
                    this.raw.recurEvery = this.transaction.recurEvery;
                    this.updateTransaction({
                        id: this.transactionId,
                        patch: { recurPeriod: 'ONCE', recurEvery: null },
                    });
                }
            },
        },
        recurPeriod: {
            get() {
                return this.transaction.recurPeriod;
            },
            set(value) {
                const recurEvery =
                    value === 'ONCE' ? null : this.transaction.recurEvery || 1;
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: { recurPeriod: value, recurEvery },
                });
            },
        },
        recurEvery: makeModelProperty('recurEvery'),
    },
    methods: {
        onBlur,
        ...mapActions(useScheduledTransactionsStore, {
            updateTransaction: transactionActions.updateTransaction,
        }),
    },
    watch: {
        transactionId() {
            Object.keys(this.raw).forEach(key => (this.raw[key] = undefined));
        },
    },
};
</script>

<style scoped>
.tight-input-group {
    margin-bottom: 0;
}
</style>
