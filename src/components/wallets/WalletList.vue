<template>
    <v-list class="pt-0" dense expand>
        <v-subheader>
            <v-list-tile-content>{{title}}</v-list-tile-content>
            <v-list-tile-action>
                <div>
                    <v-btn icon @click.prevent="showHidden = !showHidden" title="Show hidden" class="ma-0">
                        <v-icon v-if="showHidden">visibility</v-icon>
                        <v-icon v-else>visibility_off</v-icon>
                    </v-btn>
                    <slot name="titleAction"></slot>
                </div>
            </v-list-tile-action>
        </v-subheader>
        <wallet-list-item :account="wallet" :baseUrl="baseUrl" v-for="wallet in visibleWallets" :key="wallet.id"></wallet-list-item>
        <v-divider></v-divider>

        <v-list-tile no-action v-if="accounts.length > 0">
            <v-list-tile-action></v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{totalLabel}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <monetary-amount :value="totalValue"></monetary-amount>
            </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount';
    import WalletListItem from './WalletListItem.vue';
    import {VSubheader, VDivider, VList} from 'vuetify';

    export default {
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
                return this.showHidden ? this.accounts : this.accounts.filter(wallet => !wallet.hidden || wallet.balance !== 0);
            },
        },
        components: {
            VList,
            VDivider,
            MonetaryAmount,
            WalletListItem,
            VSubheader,
        },
    };
</script>
