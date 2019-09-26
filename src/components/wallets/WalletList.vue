<template>
    <v-list dense expand nav>
        <v-subheader>
            {{ title }}
            <div class="flex-grow-1"></div>
            <v-btn
                icon
                @click.prevent="showHidden = !showHidden"
                class="mx-1"
                v-if="hasHiddenWallets"
            >
                <v-icon v-if="showHidden">visibility</v-icon>
                <v-icon v-else>visibility_off</v-icon>
            </v-btn>
            <slot name="titleAction"></slot>
        </v-subheader>

        <wallet-list-item
            :account="wallet"
            :baseUrl="baseUrl"
            v-for="wallet in visibleWallets"
            :key="wallet.id"
        ></wallet-list-item>
        <v-divider></v-divider>

        <v-list-item no-action v-if="accounts.length > 0">
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
import { mapState, mapGetters, mapActions } from "vuex";
import MonetaryAmount from "../util/MonetaryAmount.vue";
import WalletListItem from "./WalletListItem.vue";

const hiddenFilter = wallet => !wallet.hidden || wallet.balance !== 0;

export default {
    props: {
        title: {
            type: String,
            required: true
        },
        totalLabel: {
            type: String,
            required: true
        },
        accounts: {
            type: Array,
            required: true
        },
        totalValue: {
            type: Number,
            required: true
        },
        baseUrl: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            showHidden: false
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
        }
    },
    components: {
        MonetaryAmount,
        WalletListItem
    }
};
</script>
