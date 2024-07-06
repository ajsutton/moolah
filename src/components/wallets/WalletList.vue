<template>
    <v-list density="compact" nav slim>
        <v-list-item>
            <v-list-item-title>{{ title }}</v-list-item-title>
            <template v-slot:append>
                <v-btn
                    v-if="hasHiddenWallets"
                    icon
                    variant="flat"
                    class="mx-1"
                    @click.prevent="showHidden = !showHidden"
                >
                    <v-icon v-if="showHidden" :icon="IconVisibility"></v-icon>
                    <v-icon v-else :icon="IconVisibilityOff"></v-icon>
                </v-btn>
                <slot name="titleAction"></slot>
            </template>
        </v-list-item>

        <div v-sortable-list="onSorted">
            <wallet-list-item
                v-for="wallet in visibleWallets"
                :key="wallet.id"
                :account="wallet"
                :base-url="baseUrl"
                class="sortHandle"
            ></wallet-list-item>
        </div>
        <v-divider></v-divider>

        <v-list-item v-if="accounts.length > 0" no-action>
            <v-list-item-title>
                {{ totalLabel }}
            </v-list-item-title>

            <template v-slot:append>
                <monetary-amount
                    class="wallet-balance"
                    :value="totalValue"
                ></monetary-amount>
            </template>
        </v-list-item>
    </v-list>
</template>

<script setup>
import IconVisibility from '~icons/mdi/visibility';
import IconVisibilityOff from '~icons/mdi/visibilityOff';
</script>

<script>
import MonetaryAmount from '../util/MonetaryAmount.vue';
import WalletListItem from './WalletListItem.vue';
import SortableList from '../util/SortableList';

const hiddenFilter = wallet => !wallet.hidden || wallet.balance !== 0;

export default {
    components: {
        MonetaryAmount,
        WalletListItem,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        totalLabel: {
            type: String,
            required: true,
        },
        accounts: {
            type: Array,
            required: true,
        },
        totalValue: {
            type: Number,
            required: true,
        },
        baseUrl: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            showHidden: false,
        };
    },
    computed: {
        visibleWallets() {
            return this.showHidden
                ? this.accounts
                : this.accounts.filter(hiddenFilter);
        },
        hasHiddenWallets() {
            return !this.accounts.every(hiddenFilter);
        },
    },
    methods: {
        onSorted({ oldIndex, newIndex }) {
            const wallets = [...this.visibleWallets];
            const moved = wallets.splice(oldIndex, 1)[0];
            wallets.splice(newIndex, 0, moved);
            if (!this.showHidden) {
                wallets.push(
                    ...this.accounts.filter(wallet => !hiddenFilter(wallet))
                );
            }
            this.$emit('sorted', wallets);
        },
    },
    directives: {
        SortableList,
    },
};
</script>
