<template>
    <v-app light>
        <account-nav :profile="profile" :loggedIn="loggedIn"></account-nav>
        <v-navigation-drawer v-model="showRightNavPanel" floating right clipped disable-route-watcher disable-resize-watcher app fixed>
            <v-card class="ma-3">
                <v-card-text>
                    <edit-transaction v-if="hasTransaction" :key="selectedTransaction.id"></edit-transaction>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>
        <v-toolbar dark class="primary" fixed app clipped-left clipped-right>
            <v-toolbar-side-icon v-if="loggedIn"
                                 @click.native.stop="showMainNav = !showMainNav"></v-toolbar-side-icon>
            <v-toolbar-title class="hidden-sm-and-down white--text" v-if="loggedIn">Moolah</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-menu :nudge-width="100" v-if="!loggedIn" bottom :nudge-bottom="50">
                    <v-btn flat slot="activator">Sign in with
                        <v-icon dark>arrow_drop_down</v-icon>
                    </v-btn>
                    <v-list>
                        <v-list-tile ripple href="/api/googleauth">
                            <v-list-tile-title>Google</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile ripple href="/api/facebookauth">
                            <v-list-tile-title>Facebook</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>

                <logout v-if="loggedIn" @logOut="loggedIn = false"></logout>
            </v-toolbar-items>
            <v-toolbar-side-icon @click.native.prevent="toggleRightNav" :disabled="!hasTransaction" v-if="loggedIn"></v-toolbar-side-icon>
        </v-toolbar>
        <v-content>
            <welcome v-if="!loggedIn"></welcome>
            <v-container fluid v-if="loggedIn" grid-list-md>
                <transition name="slide-x-reverse-transition">
                    <router-view></router-view>
                </transition>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
    import {actions as transactionActions} from './store/transactions/transactionStore';
    import {actions as accountActions} from './store/wallets/accountsStore';
    import {actions as earmarkActions} from './store/wallets/earmarksStore';
    import {mutations, actions as stateActions} from './store/store';
    import AccountNav from './components/accounts/AccountNav.vue';
    import EditTransaction from './components/transactions/EditTransaction';
    import Welcome from './components/welcome/Welcome';
    import Logout from './components/Logout';
    import client from './api/client';
    import store from './store/store';
    import {actions as categoryActions} from './store/categoryStore';

    export default {
        name: 'app',
        data() {
            return {
                loggedIn: false,
                userId: undefined,
                profile: {
                    userId: null,
                    givenName: null,
                    familyName: null,
                    picture: null,
                },
            }
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
                }
            },
            hasTransaction() {
                return this.selectedTransaction !== undefined && this.loggedIn;
            },
            ...mapGetters(['selectedTransaction']),
            ...mapState({ rightNavToggle: 'showEditTransactionPanel', mainNavToggle: 'showMainNav'})
        },
        methods: {
            toggleRightNav() {
                this.showRightNavPanel = !this.rightNavToggle;
            },
            ...mapActions('categories', [categoryActions.loadCategories]),
            ...mapActions('accounts', {loadAccounts: accountActions.loadAccounts}),
            ...mapActions('earmarks', {loadEarmarks: earmarkActions.loadEarmarks}),
            ...mapActions([stateActions.showUpcoming]),
            ...mapMutations([mutations.selectTransaction, mutations.showMainNav]),
        },
        store,
        components: {
            AccountNav,
            EditTransaction,
            Welcome,
            Logout,
        },
        async created() {
            const state = await client.userProfile();
            if (state.loggedIn) {
                await this[categoryActions.loadCategories]();
                this[stateActions.showUpcoming]();
                await this.loadAccounts();
                await this.loadEarmarks();
            }
            this.loggedIn = state.loggedIn;
            this.profile = state.profile;
        }
    }
</script>

<style>
    @import '~vuetify/dist/vuetify.min.css';
</style>
