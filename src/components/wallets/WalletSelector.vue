<template>
    <v-select
        v-model="selectedWalletId"
        :label="label"
        :items="filteredWallets"
        :clearable="clearable"
        item-text="name"
        item-value="id"
    >
        <template slot="item" slot-scope="wallet">
            <v-list-item-action>
                <v-icon>{{ icon(wallet.item) }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
                <v-list-item-title>{{ wallet.item.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
                <monetary-amount :value="wallet.item.balance"></monetary-amount>
            </v-list-item-action>
        </template>
    </v-select>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import iconForType from './walletIcon';
import MonetaryAmount from '../util/MonetaryAmount';

export default {
    components: {
        MonetaryAmount,
    },
    props: {
        label: String,
        wallets: {
            type: Array,
            required: true,
        },
        value: {
            type: String,
            required: false,
        },
        exclude: {
            type: String,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        filteredWallets() {
            return this.wallets.filter(
                wallet =>
                    wallet.id !== this.exclude &&
                    (!wallet.hidden || wallet.id === this.value)
            );
        },
        selectedWalletId: {
            get() {
                return this.value;
            },
            set(walletId) {
                this.$emit('update:value', walletId);
            },
        },
    },
    methods: {
        icon(wallet) {
            return iconForType(wallet.type);
        },
    },
};
</script>
