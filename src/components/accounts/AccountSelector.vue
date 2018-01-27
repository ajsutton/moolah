<template>
    <v-select
            :label="label"
            :items="filteredAccounts"
            v-model="selectedAccountId"
            item-text="name"
            item-value="id"
    >
        <template slot="item" slot-scope="account">
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
    import {mapGetters, mapState} from 'vuex';
    import iconForType from './accountIcon';
    import MonetaryAmount from '../util/MonetaryAmount';

    export default {
        props: {
            'label': String,
            'value': {
                type: String,
                required: true,
            },
            'excludeAccountId': {
                type: String,
            },
            'includeEarmarks': {
                type: Boolean,
                'default': false
            }
        },
        computed: {
            ...mapGetters('accounts', {standardAccounts: 'standardAccounts'}),
            ...mapState('accounts', { allAccounts: 'accounts' }),
            filteredAccounts() {
                return (this.includeEarmarks ? this.allAccounts : this.standardAccounts).filter(account => account.id !== this.excludeAccountId);
            },
            selectedAccountId: {
                get() {
                    return this.value;
                },
                set(accountId) {
                    this.$emit('update:value', accountId);
                },
            },
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
