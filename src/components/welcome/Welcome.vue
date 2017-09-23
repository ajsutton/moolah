<template>
  <div>
    <v-parallax :src="require('../../assets/brisbane-large.jpg')">
      <v-layout column align-center justify-center>
        <h1 class="white--text">Moolah</h1>
        <h4 class="white--text">Track your pot of gold</h4>
      </v-layout>
    </v-parallax>
    <v-container>
      <v-layout row wrap class="mt-3">
        <feature-panel icon="account_balance" headline="Businessy">
          We've got a fancy looking icon and pretty pictures.<br>
          Why wouldn't you love us?
        </feature-panel>
        <feature-panel icon="lock" headline="Private">
          We never sell your personal information to anyone.<br>
          Mostly because we wouldn't know who to sell it to.
        </feature-panel>
        <feature-panel icon="bug_report" headline="Buggy">
          This is a crazy side project so it's almost certain to be buggy.<br>
          But you'll probably be able to live with them.
        </feature-panel>
      </v-layout>

      <v-layout row justify-center class="mt-5">
        <a href="/api/googleauth"><img src="../../assets/auth/signin_google.png" width="191" height="46"></a>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import FeaturePanel from './FeaturePanel';

  export default {
    name: 'hello',
    data () {
      return {}
    },
    components: {
      FeaturePanel
    }
  }
</script>

<style>
  .parallax__image-container img {
    filter: brightness(60%);
  }
</style>
