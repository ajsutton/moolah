<template>
    <div>
        <div class="section-heading">Repeat</div>

        <v-select
                label="Every"
                v-model="recurPeriod"
                :items="periodItems"
        ></v-select>

        <v-text-field
                v-if="repeating"
                label="Number"
                type="number"
                :rules="rules.recurEvery"
                @blur="blur('recurEvery')"
                v-model="recurEvery"></v-text-field>
    </div>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {rules, isValid} from '../validation';
    import {makeModelProperty, onBlur} from './modelProperty';

    export default {
        props: ['transaction'],
        data() {
            return {
                periodItems: [
                    {text: 'Once', value: 'ONCE'},
                    {text: 'Day', value: 'DAY'},
                    {text: 'Week', value: 'WEEK'},
                    {text: 'Month', value: 'MONTH'},
                    {text: 'Year', value: 'YEAR'},
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
            repeating() {
                return this.transaction.recurPeriod !== 'ONCE';
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
            ...mapActions('transactions', {
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


<style scoped lang="css">
    .section-heading {
        color: rgba(0, 0, 0, 0.54);
        font-size: 16px;
        line-height: 32px;
    }
</style>
