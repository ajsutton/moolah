<template>
    <div>
        <v-switch class="tight-input-group" label="Repeat" v-model="repeating" hide-details></v-switch>
        <v-layout row v-if="repeating">
            <v-flex xs4>
                <v-text-field
                        label="Every"
                        type="number"
                        :rules="rules.recurEvery"
                        @blur="onBlur('recurEvery')"
                        v-model="recurEvery"></v-text-field>
            </v-flex>
            <v-flex xs8>
                <v-select
                        single-line
                        v-model="recurPeriod"
                        :items="periodItems"
                ></v-select>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactions/transactionStore';
    import {rules, isValid} from '../validation';
    import {makeModelProperty, onBlur} from './modelProperty';

    export default {
        props: ['transaction'],
        data() {
            return {
                periodItems: [
                    {text: 'Days', value: 'DAY'},
                    {text: 'Weeks', value: 'WEEK'},
                    {text: 'Months', value: 'MONTH'},
                    {text: 'Years', value: 'YEAR'},
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
                        this.updateTransaction({id: this.transactionId, patch: {recurPeriod: this.raw.recurPeriod || 'MONTH', recurEvery: this.raw.recurEvery || 1}});
                    } else {
                        this.raw.recurPeriod = this.transaction.recurPeriod;
                        this.raw.recurEvery = this.transaction.recurEvery;
                        this.updateTransaction({id: this.transactionId, patch: {recurPeriod: 'ONCE', recurEvery: null}});
                    }
                },
            },
            recurPeriod: {
                get() {
                    return this.transaction.recurPeriod;
                },
                set(value) {
                    const recurEvery = value === 'ONCE' ? null : this.transaction.recurEvery || 1;
                    this.updateTransaction({id: this.transaction.id, patch: {recurPeriod: value, recurEvery}});
                }
            },
            recurEvery: makeModelProperty('recurEvery'),
        },
        methods: {
            onBlur,
            ...mapActions('scheduledTransactions', {
                updateTransaction: transactionActions.updateTransaction,
            }),
        },
        watch: {
            transactionId() {
                Object.keys(this.raw).forEach(key => this.raw[key] = undefined);
            },
        },
    };
</script>

<style scoped>
    .tight-input-group {
        margin-bottom: 0;
    }
</style>
