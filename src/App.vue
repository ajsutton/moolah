<template>
    <v-app light>
        <main-nav :profile="profile" :loggedIn="loggedIn"></main-nav>
        <v-navigation-drawer
            v-model="showRightNavPanel"
            floating
            right
            clipped
            disable-route-watcher
            disable-resize-watcher
            app
            fixed
            width="300px"
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
        <v-app-bar
            dark
            class="primary"
            fixed
            app
            clipped-left
            clipped-right
            v-if="!loading"
        >
            <v-app-bar-nav-icon
                v-if="loggedIn"
                @click.native.stop="showMainNav = !showMainNav"
            ></v-app-bar-nav-icon>
            <v-toolbar-title
                class="hidden-sm-and-down white--text"
                v-if="loggedIn"
                >Moolah</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-menu
                    :nudge-width="100"
                    v-if="!loggedIn && !loading"
                    bottom
                    :nudge-bottom="50"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn text v-on="on"
                            >Sign in with
                            <v-icon>arrow_drop_down</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item ripple href="/api/googleauth">
                            <v-list-item-title>Google</v-list-item-title>
                        </v-list-item>
                        <v-list-item ripple href="/api/facebookauth">
                            <v-list-item-title>Facebook</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <logout v-if="loggedIn" @logOut="loggedIn = false"></logout>
            </v-toolbar-items>
            <v-app-bar-nav-icon
                @click.native.prevent="toggleRightNav"
                :disabled="!hasTransaction"
                v-if="loggedIn"
            ></v-app-bar-nav-icon>
        </v-app-bar>
        <v-main>
            <loading-screen v-if="loading"></loading-screen>
            <welcome v-else-if="!loggedIn"></welcome>
            <v-container fluid v-if="loggedIn" grid-list-md>
                <transition name="slide-x-reverse-transition">
                    <router-view></router-view>
                </transition>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex';
import { actions as transactionActions } from './store/transactions/transactionStore';
import { actions as accountActions } from './store/wallets/accountsStore';
import { actions as earmarkActions } from './store/wallets/earmarksStore';
import { mutations, actions as stateActions } from './store/store';
import MainNav from './components/MainNav.vue';
import EditTransaction from './components/transactions/EditTransaction';
import Welcome from './components/welcome/Welcome';
import LoadingScreen from './components/welcome/LoadingScreen.vue';
import Logout from './components/Logout';
import client from './api/client';
import store from './store/store';
import { actions as categoryActions } from './store/categoryStore';

export default {
    name: 'app',
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
        showMainNav: {
            get() {
                return this.mainNavToggle && this.loggedIn;
            },
            set(value) {
                this.$store.commit(mutations.showMainNav, value);
            },
        },
        showRightNavPanel: {
            get() {
                return this.hasTransaction && this.rightNavToggle;
            },
            set(value) {
                this.$store.commit(mutations.showEditTransactionPanel, value);
            },
        },
        hasTransaction() {
            return this.selectedTransaction !== undefined && this.loggedIn;
        },
        ...mapGetters(['selectedTransaction']),
        ...mapState({
            rightNavToggle: 'showEditTransactionPanel',
            mainNavToggle: 'showMainNav',
        }),
    },
    methods: {
        toggleRightNav() {
            this.showRightNavPanel = !this.rightNavToggle;
        },
        ...mapActions('categories', [categoryActions.loadCategories]),
        ...mapActions('accounts', {
            loadAccounts: accountActions.loadAccounts,
        }),
        ...mapActions('earmarks', {
            loadEarmarks: earmarkActions.loadEarmarks,
        }),
        ...mapActions([stateActions.showUpcoming]),
        ...mapMutations([mutations.selectTransaction, mutations.showMainNav]),
    },
    store,
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

<style>
@import '~vuetify/dist/vuetify.min.css';
</style>
