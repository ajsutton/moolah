<template>
    <v-select
        v-model="selectedWalletId"
        :label="label"
        :items="filteredWallets"
        :clearable="clearable"
        item-title="name"
        item-value="id"
        :item-props="true"
    >
        <template v-slot:item="{props, item}" >
            <v-list-item v-bind="props">
                <template v-slot:prepend>
                    <v-list-item-action>
                        <v-icon :icon="icon(props)"></v-icon>
                    </v-list-item-action>
                </template>

                <v-list-item-title>{{ item.name }}</v-list-item-title>

                <template v-slot:append>
                    <v-list-item-action>
                        <monetary-amount :value="props.balance"></monetary-amount>
                    </v-list-item-action>
                </template>
            </v-list-item>
        </template>
    </v-select>
</template>

<script>
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
        icon(props) {
            return iconForType(props.type);
        },
    },
};
</script>
