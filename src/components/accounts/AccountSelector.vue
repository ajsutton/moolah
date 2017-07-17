<template>
    <v-select
            :label="label"
            :items="filteredAccounts"
            v-model="selectedAccountId"
            item-text="name"
            item-value="id"
    >
        <template slot="item" scope="account">
            <v-list-tile-action>
                <v-icon>{{ icon(account.item) }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ account.item.name }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="account.item.balance"></monetary-amount>
            </v-list-tile-action>
        </template>
    </v-select>
</template>

<script>
    import {mapState} from 'vuex';
    import iconForType from './accountIcon';
    import MonetaryAmount from '../util/MonetaryAmount';

    export default {
        props: ['label', 'value', 'excludeAccountId'],
        computed: {
            ...mapState('accounts', {
                accounts: state => state.accounts,
            }),
            filteredAccounts() {
                return this.accounts.filter(account => account.id !== this.excludeAccountId);
            },
            selectedAccountId: {
                get() {
                    return this.value;
                },
                set(accountId) {
                    this.$emit('update:value', accountId);
                }
            }
        },
        methods: {
            icon(account) {
                return iconForType(account.type);
            },
        },
        components: {
            MonetaryAmount,
        },
    };
</script>
