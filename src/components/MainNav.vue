<template>
    <v-navigation-drawer
        v-model="mainNavVisible"
        theme="dark"
        permanent
        width="300"
    >
        <template v-if="loggedIn">
            <wallet-list
                title="Current Accounts"
                :accounts="currentAccounts"
                base-url="/account"
                total-label="Current funds"
                :total-value="currentAccountsBalance"
            >
                <template v-slot:titleAction>
                    <create-account></create-account>
                </template>
            </wallet-list>
            <wallet-list
                title="Earmarked"
                :accounts="earmarks"
                base-url="/earmark"
                total-label="Available funds"
                :total-value="availableFunds"
            >
                <template v-slot:titleAction>
                    <create-earmark theme="dark"></create-earmark>
                </template>
            </wallet-list>
            <wallet-list
                v-if="noncurrentAccounts.length > 0"
                title="Investments"
                :accounts="noncurrentAccounts"
                base-url="/account"
                total-label="Net worth"
                :total-value="networth"
            >
                <template v-slot:titleAction>
                    <create-account dark></create-account>
                </template>
            </wallet-list>

            <v-list density="compact" nav>
                <v-list-item to="/" exact>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-trending-up"></v-icon>
                    </template>
                    <v-list-item-title>Analysis</v-list-item-title>
                </v-list-item>
                <v-list-item to="/reports/">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-file-chart"></v-icon>
                    </template>
                    <v-list-item-title>Reports</v-list-item-title>
                </v-list-item>
                <v-list-item to="/categories/">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-folder-open"></v-icon>
                    </template>
                    <v-list-item-title>Categories</v-list-item-title>
                </v-list-item>
                <v-list-item to="/upcoming/">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-clock-outline"></v-icon>
                    </template>
                    <v-list-item-title>Upcoming transactions</v-list-item-title>
                </v-list-item>
                <v-list-item to="/transactions/">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-list-box"></v-icon>
                    </template>
                    <v-list-item-title>All transactions</v-list-item-title>
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
