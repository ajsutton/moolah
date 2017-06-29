<template>
  <v-app>
    <v-navigation-drawer></v-navigation-drawer>
    <v-toolbar light>
      <v-toolbar-title class="hidden-sm-and-down">Moolah</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-toolbar-item v-if="!loggedIn" href="/api/googleauth">Sign in</v-toolbar-item>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <v-container fluid>
        <hello v-if="!loggedIn"></hello>
        <router-view v-if="loggedIn"></router-view>
      </v-container>
    </main>
    <v-footer>
      <div v-if="!loggedIn">Hero image by
        <a class="white--text" href="https://www.flickr.com/photos/tfpc/8626221286/in/photolist-e9gD4d-quxKNs-ojD7vn-oLTTjf-bhu5VR-ooVMzE-stE5Hy-UHvTs5-cjKs7Q-qtZFwc-on9mWD-fy7Wfq-974AH9-nZYchC-nqxyve-d4cqn1-Vot94w-oqAd7p-reacHf-pN74aF-e9X8Gr-roWWAp-Vtb3iX-q13JJE-8j3xrm-qc4tA4-mxPSUi-omprtS-i4EEEk-rKzLGe-TQTbpq-ejkdJi-mfQ4eZ-cAivyE-n2EDm-p1Qcqo-gNM15i-S8jsyY-jvyQyz-gYBgNG-prbC1E-hgpcdc-fMWVLT-fwKmbh-fdoGLG-NZiXrx-bQHfND-ouwqpR-cvAj4Y-iHVNN5">Toby Charlton-Taylor</a>.</div>
      <v-spacer></v-spacer>
      <div>© {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>

<script>
import AccountList from './AccountList';
import LoginPanel from './LoginPanel';
import Hello from './components/Hello';
import client from './api/client';
export default {
  name: 'app',
  data() {
    return {
      loggedIn: false,
      userId: undefined,
      profile: {
        givenName: undefined,
        familyName: undefined,
      }
    }
  },
  components: {
    AccountList,
    LoginPanel,
    Hello,
  },
  async created() {
    const state = await client.userProfile();
    this.loggedIn = state.loggedIn;
    this.userId = state.userId;
    this.profile = state.profile;
  }
}
</script>

<style lang="stylus">
  @import '../node_modules/vuetify/src/stylus/main.styl';
</style>
