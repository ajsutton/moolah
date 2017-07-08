<template>
    <v-app light>
        <v-navigation-drawer persistent clipped v-model="showMainNav" v-if="loggedIn" dark>
            <v-list class="pa-0">
                <v-list-tile avatar>
                    <v-list-tile-avatar v-if="profile.picture">
                        <img :src="profile.picture"/>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{profile.givenName}} {{profile.familyName}}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <create-account></create-account>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
            <account-list></account-list>
        </v-navigation-drawer>
        <v-toolbar class="primary">
            <v-toolbar-side-icon dark v-if="loggedIn"
                                 @click.native.stop="showMainNav = !showMainNav"></v-toolbar-side-icon>
            <v-toolbar-title class="hidden-sm-and-down white--text" v-if="loggedIn">Moolah</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn flat dark ripple v-if="!loggedIn" tag="a" href="/api/googleauth">Sign in</v-btn>
                <logout v-if="loggedIn" @logOut="loggedIn = false"></logout>
            </v-toolbar-items>
        </v-toolbar>
        <main>
            <welcome v-if="!loggedIn"></welcome>
            <v-container fluid v-if="loggedIn">
                <router-view></router-view>
            </v-container>
            <v-footer class="primary" v-if="!loggedIn">
                <div v-if="!loggedIn">Hero image by
                    <a class="white--text"
                       href="https://www.flickr.com/photos/tfpc/8626221286/in/photolist-e9gD4d-quxKNs-ojD7vn-oLTTjf-bhu5VR-ooVMzE-stE5Hy-UHvTs5-cjKs7Q-qtZFwc-on9mWD-fy7Wfq-974AH9-nZYchC-nqxyve-d4cqn1-Vot94w-oqAd7p-reacHf-pN74aF-e9X8Gr-roWWAp-Vtb3iX-q13JJE-8j3xrm-qc4tA4-mxPSUi-omprtS-i4EEEk-rKzLGe-TQTbpq-ejkdJi-mfQ4eZ-cAivyE-n2EDm-p1Qcqo-gNM15i-S8jsyY-jvyQyz-gYBgNG-prbC1E-hgpcdc-fMWVLT-fwKmbh-fdoGLG-NZiXrx-bQHfND-ouwqpR-cvAj4Y-iHVNN5">Toby Charlton-Taylor</a>.
                </div>
                <v-spacer></v-spacer>
                <div><a class="white--text" href="https://moolah.rocks/">Moolah.rocks</a></div>
            </v-footer>
        </main>
    </v-app>
</template>

<script>
    import AccountList from './components/AccountList';
    import CreateAccount from './components/CreateAccount';
    import Welcome from './components/welcome/Welcome';
    import Logout from './components/Logout';
    import client from './api/client';
    import store from './store/store';

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
                showMainNav: true,
            }
        },
        store,
        components: {
            AccountList,
            CreateAccount,
            Welcome,
            Logout
        },
        async created() {
            const state = await client.userProfile();
            this.loggedIn = state.loggedIn;
            this.profile = state.profile;
        }
    }
</script>

<style lang="stylus">
    @import '../node_modules/vuetify/src/stylus/main'
</style>
