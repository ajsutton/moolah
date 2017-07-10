<template>
    <div class="pl-2 pr-2">
        <v-text-field name="payee" label="Payee" v-model="payee" :rules="rules.payee" @blur="blur('payee')"></v-text-field>

        <v-menu
          lazy
          :close-on-content-click="true"
          v-model="dateMenu"
          offset-y
          full-width
          :nudge-left="40"
          max-width="290px"
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
        <v-text-field name="amount" label="Amount" v-model="amount" :rules="rules.amount" @blur="blur('amount')"></v-text-field>
        <v-text-field name="notes" label="Notes" v-model="notes" :rules="rules.notes" @blur="blur('notes')" multiLine></v-text-field>
    </div>
</template>
<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {rules, isValid} from '../validation';

    function makeModelProperty(propertyName, toDisplay = value=>value, fromDisplay = value=>value) {
        return {
            get() {
                if (this.raw[propertyName] === undefined) {
                    return this.transaction ? toDisplay(this.transaction[propertyName]) : undefined;
                } else {
                    return this.raw[propertyName];
                }
            },
            set(value) {
                this.raw[propertyName] = value;
                if (isValid(value, this.rules[propertyName])) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {[propertyName]: fromDisplay(value)},
                    });
                }
            },
        };
    }

    export default {
        data() {
            return {
                dateMenu: false,
                raw: {
                    payee: undefined,
                    amount: undefined,
                    note: undefined,
                    date: undefined,
                },
                rules
            };
        },
        computed: {
            ...mapGetters('transactions', {
                transaction: 'selectedTransaction',
            }),
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
            amount: {
                get() {
                    if (this.raw.amount === undefined) {
                        return this.transaction ? (this.transaction.amount / 100).toFixed(2) : undefined;
                    } else {
                        return this.raw.amount;
                    }
                },
                set(value) {
                    this.raw.amount = value;
                    if (isValid(value, this.rules.amount)) {
                        this.updateTransaction({
                            id: this.transaction.id,
                            patch: {amount: Math.round(value * 100)},
                        });
                    }
                },
            },
        },
        methods: {
            blur(property) {
                if (isValid(this.raw[property], this.rules[property])) {
                    this.raw[property] = undefined;
                }
            },
            ...mapActions('transactions', {
                updateTransaction: transactionActions.updateTransaction
            })
        }
    };
</script>
