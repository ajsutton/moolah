<template>
    <div>
        <v-text-field name="payee" label="Payee" v-model="payee"></v-text-field>
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
                    [propertyName]: value,
                });
            }
        }
    }
    export default {
        computed: {
            ...mapGetters('transactions', {
                transaction: 'selectedTransaction',
            }),
            payee: makeModelProperty('payee'),
        },
        methods: {
            ...mapActions('transactions', {
                updateTransaction: transactionActions.updateTransaction
            })
        }
    };
</script>
