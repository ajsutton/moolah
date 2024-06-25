<template>
    <v-list dense expand nav>
        <v-subheader>
            {{ title }}
            <div class="flex-grow-1"></div>
            <v-btn
                v-if="hasHiddenWallets"
                icon
                class="mx-1"
                @click.prevent="showHidden = !showHidden"
            >
                <v-icon v-if="showHidden">visibility</v-icon>
                <v-icon v-else>visibility_off</v-icon>
            </v-btn>
            <slot name="titleAction"></slot>
        </v-subheader>

        <wallet-list-item
            v-for="wallet in visibleWallets"
            :key="wallet.id"
            :account="wallet"
            :base-url="baseUrl"
        ></wallet-list-item>
        <v-divider></v-divider>

        <v-list-item v-if="accounts.length > 0" no-action>
            <v-list-item-content>
                <v-list-item-title>
                    {{ totalLabel }}
                    <monetary-amount
                        class="float-right"
                        :value="totalValue"
                    ></monetary-amount>
                </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-list>
</template>

<script>
import MonetaryAmount from '../util/MonetaryAmount.vue';
import WalletListItem from './WalletListItem.vue';

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
};
</script>
