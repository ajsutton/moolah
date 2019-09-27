<template>
    <v-select
        :label="label"
        :items="filteredWallets"
        :clearable="clearable"
        v-model="selectedWalletId"
        item-text="name"
        item-value="id"
    >
        <template slot="item" slot-scope="wallet">
            <v-list-tile-action>
                <v-icon>{{ icon(wallet.item) }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ wallet.item.name }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="wallet.item.balance"></monetary-amount>
            </v-list-tile-action>
        </template>
    </v-select>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import iconForType from './walletIcon';
import MonetaryAmount from '../util/MonetaryAmount';

export default {
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
    components: {
        MonetaryAmount,
    },
};
</script>
