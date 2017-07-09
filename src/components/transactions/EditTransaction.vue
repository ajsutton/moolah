<template>
    <div>
        <v-text-field name="payee" label="Payee" v-model="payee"></v-text-field>

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
        <v-text-field name="amount" label="Amount" v-model="amount"></v-text-field>
        <v-text-field name="notes" label="Notes" v-model="notes"></v-text-field>
    </div>
</template>
<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions as transactionActions} from '../../store/transactionStore';

    function makeModelProperty(propertyName) {
        return {
            get() {
                return this.transaction ? this.transaction[propertyName] : undefined;
            },
            set(value) {
                this.updateTransaction({
                    id: this.transaction.id,
                    patch: {[propertyName]: value},
                });
            }
        }
    }
    export default {
        data() {
            return {
                dateMenu: false,
            };
        },
        computed: {
            ...mapGetters('transactions', {
                transaction: 'selectedTransaction',
            }),
            payee: makeModelProperty('payee'),
            notes: makeModelProperty('notes'),
            date: makeModelProperty('date'),
            amount: {
                get() {
                    return this.transaction ? this.transaction.amount / 100 : undefined;
                },
                set(value) {
                    this.updateTransaction({
                        id: this.transaction.id,
                        patch: {amount: Math.round(value * 100)},
                    });
                },
            },
        },
        methods: {
            ...mapActions('transactions', {
                updateTransaction: transactionActions.updateTransaction
            })
        }
    };
</script>
