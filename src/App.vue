<template>
    <v-app>
        <v-app-bar v-if="!loading" class="bg-primary">
            <v-app-bar-nav-icon
                v-if="loggedIn"
                @click.stop="mainNavVisible = !mainNavVisible"
            ></v-app-bar-nav-icon>
            <v-toolbar-title
                v-if="loggedIn"
                class="hidden-sm-and-down text-white"
                >Moolah</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn
                    v-if="!loggedIn && !loading"
                    variant="text"
                    href="/api/googleauth"
                    >Sign In</v-btn
                >
                <logout v-if="loggedIn" @logOut="loggedIn = false"></logout>
            </v-toolbar-items>
            <v-app-bar-nav-icon
                v-if="loggedIn"
                :disabled="!hasTransaction"
                @click.prevent="toggleRightNav"
            ></v-app-bar-nav-icon>
        </v-app-bar>
        <main-nav :profile="profile" :logged-in="loggedIn"></main-nav>
        <v-navigation-drawer
            v-if="showRightNavPanel"
            floating
            location="right"
            disable-route-watcher
            disable-resize-watcher
            width="300"
        >
            <v-card class="ma-3">
                <v-card-text>
                    <edit-transaction
                        v-if="hasTransaction"
                        :key="selectedTransaction.id"
                    ></edit-transaction>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>
        <v-main>
            <loading-screen v-if="loading"></loading-screen>
            <welcome v-else-if="!loggedIn"></welcome>
            <v-container v-if="loggedIn" fluid grid-list-md>
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import {
    useRootStore,
    mutations,
    actions as stateActions,
} from './stores/root';
import {
    useCategoryStore,
    actions as categoryActions,
} from './stores/categoryStore';
import {
    useAccountsStore,
    actions as accountActions,
} from './stores/accountsStore';
import {
    useEarmarksStore,
    actions as earmarkActions,
} from './stores/earmarksStore';
import MainNav from './components/MainNav.vue';
import EditTransaction from './components/transactions/EditTransaction.vue';
import Welcome from './components/welcome/Welcome.vue';
import LoadingScreen from './components/welcome/LoadingScreen.vue';
import Logout from './components/Logout.vue';
import client from './api/client';

export default {
    name: 'App',
    data() {
        return {
            loading: true,
            loggedIn: false,
            userId: undefined,
            profile: {
                userId: null,
                givenName: null,
                familyName: null,
                picture: null,
            },
        };
    },
    computed: {
        mainNavVisible: {
            get() {
                return this.showMainNav && this.loggedIn;
            },
            set(value) {
                this[mutations.showMainNav](value);
            },
        },
        showRightNavPanel() {
            return this.hasTransaction && this.showEditTransactionPanel;
        },
        hasTransaction() {
            return this.selectedTransaction !== undefined && this.loggedIn;
        },
        ...mapState(useRootStore, [
            'selectedTransaction',
            'showEditTransactionPanel',
            'showMainNav',
        ]),
    },
    methods: {
        toggleRightNav() {
            this[mutations.showEditTransactionPanel](
                !this.showEditTransactionPanel
            );
        },
        ...mapActions(useCategoryStore, [categoryActions.loadCategories]),
        ...mapActions(useAccountsStore, {
            loadAccounts: accountActions.loadAccounts,
        }),
        ...mapActions(useEarmarksStore, {
            loadEarmarks: earmarkActions.loadEarmarks,
        }),
        ...mapActions(useRootStore, [
            stateActions.showUpcoming,
            mutations.selectTransaction,
            mutations.showEditTransactionPanel,
            mutations.showMainNav,
        ]),
    },
    components: {
        MainNav,
        EditTransaction,
        Welcome,
        Logout,
        LoadingScreen,
    },
    async created() {
        const state = await client.userProfile();
        if (state.loggedIn) {
            await this[categoryActions.loadCategories]();
            this[stateActions.showUpcoming]();
            await Promise.all([this.loadAccounts(), this.loadEarmarks()]);
        }
        this.profile = state.profile;
        this.loading = false;
        this.loggedIn = state.loggedIn;
    },
};
</script>
