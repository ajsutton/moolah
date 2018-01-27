<template>
    <v-navigation-drawer clipped v-model="showMainNav" dark app fixed>
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
            <account-list title="Accounts" :accounts="standardAccounts" totalLabel="Net worth" :totalValue="networthWithEarmarks"></account-list>
            <account-list title="Earmarked" :accounts="earmarkAccounts" totalLabel="Available funds" :totalValue="networth" v-if="hasEarmarks"></account-list>
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
    import AccountList from './AccountList';
    import CreateAccount from './CreateAccount';
    import client from '../../api/client';
    import store, {mutations} from '../../store/store';

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
                return this.earmarkAccounts.length > 0;
            },
            ...mapState({mainNavToggle: 'showMainNav'}),
            ...mapGetters('accounts', ['networth', 'networthWithEarmarks', 'standardAccounts', 'earmarkAccounts']),
        },
        components: {
            AccountList,
            CreateAccount,
        },
    };
</script>
