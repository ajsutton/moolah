<template>
    <v-list-tile @click.native.stop="editTransaction(transaction)" v-model="selected" ripple>
        <v-list-tile-content>
            <v-list-tile-title>{{transactionTitle}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <monetary-amount :value="transaction.amount"></monetary-amount>
            <monetary-amount :value="transaction.balance"></monetary-amount>
        </v-list-tile-action>
    </v-list-tile>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import client from '../../api/client';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {actions as transactionActions} from '../../store/transactionStore';
    import {actions as stateActions, mutations as stateMutations} from '../../store/store';

    export default {
        props: ['transaction'],
        data() {
            return {};
        },
        computed: {
            transactionTitle() {
                if (this.transaction.type === 'openingBalance') {
                    return 'Opening Balance';
                } else {
                    return this.transaction.payee;
                }
            },
            selected() {
                return this.transaction === this.selectedTransaction;
            },
            ...mapGetters('transactions', ['selectedTransaction']),
        },

        methods: {
            editTransaction(transaction) {
                this.$store.commit(stateMutations.selectTransaction, transaction.id);
            },
        },

        components: {
            MonetaryAmount,
        }
    };
</script>
