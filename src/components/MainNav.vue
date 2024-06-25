<template>
    <v-navigation-drawer
        v-model="mainNavVisible"
        clipped
        dark
        app
        fixed
        width="300px"
    >
        <template v-if="loggedIn">
            <wallet-list
                title="Current Accounts"
                :accounts="currentAccounts"
                base-url="/account"
                total-label="Current funds"
                :total-value="currentAccountsBalance"
            >
                <create-account slot="titleAction" dark></create-account>
            </wallet-list>
            <wallet-list
                title="Earmarked"
                :accounts="earmarks"
                base-url="/earmark"
                total-label="Available funds"
                :total-value="availableFunds"
            >
                <create-earmark slot="titleAction" dark></create-earmark>
            </wallet-list>
            <wallet-list
                v-if="noncurrentAccounts.length > 0"
                title="Investments"
                :accounts="noncurrentAccounts"
                base-url="/account"
                total-label="Net worth"
                :total-value="networth"
            >
                <create-account slot="titleAction" dark></create-account>
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
            <div class="pb-16 pa-16"></div>
        </template>
    </v-navigation-drawer>
</template>

<script>
import { mapState } from 'pinia';
import WalletList from './wallets/WalletList.vue';
import CreateAccount from './accounts/CreateAccount.vue';
import CreateEarmark from './earmarks/CreateEarmark.vue';
import { useAccountsStore } from '../stores/accountsStore';
import { useEarmarksStore } from '../stores/earmarksStore';
import { useRootStore } from '../stores/root';

export default {
    props: {
        profile: Object,
        loggedIn: Boolean,
    },
    data() {
        return {};
    },
    computed: {
        mainNavVisible: {
            get() {
                return this.showMainNav && this.loggedIn;
            },
            set() {},
        },
        ...mapState(useRootStore, ['showMainNav']),
        ...mapState(useRootStore, ['availableFunds', 'totalNetWorth']),
        ...mapState(useEarmarksStore, ['earmarks']),
        ...mapState(useAccountsStore, [
            'accounts',
            'networth',
            'currentAccounts',
            'noncurrentAccounts',
            'currentAccountsBalance',
            'noncurrentAccountsBalance',
        ]),
    },
    components: {
        WalletList,
        CreateAccount,
        CreateEarmark,
    },
};
</script>
