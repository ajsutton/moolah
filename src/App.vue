<template>
    <v-app light toolbar>
        <v-navigation-drawer persistent clipped enable-resize-watcher disable-route-watcher v-model="showMainNav" dark>
            <template v-if="loggedIn">
                <v-list class="pa-0">
                    <v-list-tile avatar>
                        <v-list-tile-avatar v-if="profile.picture">
                            <img :src="profile.picture"/>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{profile.givenName}} {{profile.familyName}}</v-list-tile-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <create-account dark></create-account>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
                <account-list></account-list>
                <v-list>
                    <v-list-tile  ripple to="/transactions/">
                        <v-list-tile-action>
                            <v-icon dark>list</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>All Transactions</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile ripple to="/categories/">
                        <v-list-tile-action>
                            <v-icon dark>list</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Categories</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile ripple to="/upcoming/">
                        <v-list-tile-action>
                            <v-icon dark>list</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Upcoming</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </template>
        </v-navigation-drawer>
        <v-navigation-drawer :value="showRightNavPanel" class="transparent" floating light right persistent clipped disable-route-watcher>
            <v-card class="ma-3">
                <v-card-text>
                    <edit-transaction v-if="hasTransaction"></edit-transaction>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>
        <v-toolbar class="primary" fixed>
            <v-toolbar-side-icon dark v-if="loggedIn"
                                 @click.native.stop="showMainNav = !showMainNav"></v-toolbar-side-icon>
            <v-toolbar-title class="hidden-sm-and-down white--text" v-if="loggedIn">Moolah</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn flat dark ripple v-if="!loggedIn" tag="a" href="/api/googleauth">Sign in</v-btn>
                <logout v-if="loggedIn" @logOut="loggedIn = false"></logout>
            </v-toolbar-items>
            <v-toolbar-side-icon @click.native.prevent="toggleRightNav" dark :disabled="!hasTransaction"></v-toolbar-side-icon>
        </v-toolbar>
        <main>
            <welcome v-if="!loggedIn"></welcome>
            <v-container fluid v-if="loggedIn">
                <router-view></router-view>
            </v-container>
        </main>
        <v-footer class="primary" v-if="!loggedIn">
            <div v-if="!loggedIn">Hero image by
                <a class="white--text"
                   href="https://www.flickr.com/photos/tfpc/8626221286/in/photolist-e9gD4d-quxKNs-ojD7vn-oLTTjf-bhu5VR-ooVMzE-stE5Hy-UHvTs5-cjKs7Q-qtZFwc-on9mWD-fy7Wfq-974AH9-nZYchC-nqxyve-d4cqn1-Vot94w-oqAd7p-reacHf-pN74aF-e9X8Gr-roWWAp-Vtb3iX-q13JJE-8j3xrm-qc4tA4-mxPSUi-omprtS-i4EEEk-rKzLGe-TQTbpq-ejkdJi-mfQ4eZ-cAivyE-n2EDm-p1Qcqo-gNM15i-S8jsyY-jvyQyz-gYBgNG-prbC1E-hgpcdc-fMWVLT-fwKmbh-fdoGLG-NZiXrx-bQHfND-ouwqpR-cvAj4Y-iHVNN5">Toby Charlton-Taylor</a>.
            </div>
            <v-spacer></v-spacer>
            <div><a class="white--text" href="https://moolah.rocks/">Moolah.rocks</a></div>
        </v-footer>
    </v-app>
</template>

<script>
    import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
    import {actions as transactionActions} from './store/transactionStore';
    import {mutations, actions as stateActions} from './store/store';
    import AccountList from './components/accounts/AccountList';
    import EditTransaction from './components/transactions/EditTransaction';
    import CreateAccount from './components/accounts/CreateAccount';
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
                mainNavToggle: true,
            }
        },
        computed: {
            showMainNav: {
                get() {
                    return this.mainNavToggle && this.loggedIn;
                },
                set(value) {
                    this.mainNavToggle = value;
                },
            },
            showRightNavPanel() {
                return this.hasTransaction && this.rightNavToggle;
            },
            hasTransaction() {
                return this.selectedTransaction !== undefined && this.loggedIn;
            },
            ...mapGetters(['selectedTransaction']),
            ...mapState({ rightNavToggle: 'showEditTransactionPanel'})
        },
        methods: {
            toggleRightNav() {
                this.$store.commit(mutations.showEditTransactionPanel, !this.rightNavToggle);
            },
            ...mapActions('categories', [categoryActions.loadCategories]),
            ...mapActions([stateActions.showUpcoming]),
            ...mapMutations([mutations.selectTransaction]),
        },
        store,
        components: {
            AccountList,
            CreateAccount,
            EditTransaction,
            Welcome,
            Logout,
        },
        async created() {
            const state = await client.userProfile();
            if (state.loggedIn) {
                await this[categoryActions.loadCategories]();
                this[stateActions.showUpcoming]();
            }
            this.loggedIn = state.loggedIn;
            this.profile = state.profile;
            document.addEventListener('keydown', e => {
                if (this.$store.getters['accounts/selectedAccount'] !== undefined && e.code === 'KeyI' && e.ctrlKey) {
                    this.$store.dispatch('transactions/' + transactionActions.addTransaction);
                }
            });
        }
    }
</script>

<style lang="stylus">
    @import '../node_modules/vuetify/src/stylus/settings/_colors'

    $theme := {
        primary: $blue.darken-2
        accent: $pink.accent-2
        secondary: $grey.darken-3
        info: $blue.base
        warning: $amber.base
        error: $red.base
        success: $green.base
    }

    @import '../node_modules/vuetify/src/stylus/main'
</style>
