<template>
    <v-navigation-drawer clipped v-model="showMainNav" dark app fixed>
        <template v-if="loggedIn">
            <wallet-list title="Accounts" :accounts="accounts" baseUrl="/account" totalLabel="Net worth" :totalValue="networth">
                <create-account dark slot="titleAction"></create-account>
            </wallet-list>
            <wallet-list title="Earmarked" :accounts="earmarks" baseUrl="/earmark" icon="bookmark_outline" totalLabel="Available funds" :totalValue="availableFunds" v-if="hasEarmarks">
                <create-earmark dark slot="titleAction"></create-earmark>
            </wallet-list>
            <v-list>
                <v-list-tile ripple to="/" exact>
                    <v-list-tile-action>
                        <v-icon dark>trending_up</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Analysis</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile ripple to="/categories/">
                    <v-list-tile-action>
                        <v-icon dark>folder_open</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Categories</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile ripple to="/upcoming/">
                    <v-list-tile-action>
                        <v-icon dark>schedule</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Upcoming transactions</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile ripple to="/transactions/">
                    <v-list-tile-action>
                        <v-icon>list</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>All transactions</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script>
    import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
    import WalletList from './wallets/WalletList.vue';
    import CreateAccount from './accounts/CreateAccount.vue';
    import CreateEarmark from './earmarks/CreateEarmark.vue';
    import client from '../api/client';
    import store, {mutations} from '../store/store';

    export default {
        props: {
            profile: Object,
            loggedIn: Boolean,
        },
        data() {
            return {};
        },
        computed: {
            showMainNav: {
                get() {
                    return this.mainNavToggle && this.loggedIn;
                },
                set(value) {
                    this.$store.commit(mutations.showMainNav, value);
                },
            },
            hasEarmarks() {
                return this.earmarks.length > 0;
            },
            ...mapState({mainNavToggle: 'showMainNav'}),
            ...mapGetters('accounts', ['networth']),
            ...mapGetters(['availableFunds']),
            ...mapState('earmarks', ['earmarks']),
            ...mapState('accounts', ['accounts']),
        },
        components: {
            WalletList,
            CreateAccount,
            CreateEarmark,
        },
    };
</script>
