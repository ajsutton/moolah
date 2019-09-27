<template>
    <v-navigation-drawer
        clipped
        v-model="showMainNav"
        dark
        app
        fixed
        width="300px"
    >
        <template v-if="loggedIn">
            <wallet-list
                title="Accounts"
                :accounts="accounts"
                baseUrl="/account"
                totalLabel="Net worth"
                :totalValue="networth"
            >
                <create-account dark slot="titleAction"></create-account>
            </wallet-list>
            <wallet-list
                title="Earmarked"
                :accounts="earmarks"
                baseUrl="/earmark"
                totalLabel="Available funds"
                :totalValue="availableFunds"
            >
                <create-earmark dark slot="titleAction"></create-earmark>
            </wallet-list>
            <v-list dense expand nav>
                <v-list-item ripple to="/" exact>
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon>trending_up</v-icon>
                            Analysis
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item ripple to="/reports/">
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon>mdi-file-chart</v-icon>
                            Reports
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item ripple to="/categories/">
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon>folder_open</v-icon>
                            Categories
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item ripple to="/upcoming/">
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon>schedule</v-icon>
                            Upcoming transactions
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item ripple to="/transactions/">
                    <v-list-item-content>
                        <v-list-item-title>
                            <v-icon>list</v-icon>
                            All transactions
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex';
import WalletList from './wallets/WalletList.vue';
import CreateAccount from './accounts/CreateAccount.vue';
import CreateEarmark from './earmarks/CreateEarmark.vue';
import client from '../api/client';
import store, { mutations } from '../store/store';

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
        ...mapState({ mainNavToggle: 'showMainNav' }),
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
