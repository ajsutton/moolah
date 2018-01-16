<template>
  <div>
    <v-jumbotron :src="require('../../assets/jumbo-background.jpg')">
      <v-container fill-height>
        <v-layout align-center>
          <v-flex>
            <h1 class="white--text display-3 text-xs-center">Moolah</h1>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>
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

      <v-layout row class="mt-5 login-buttons" justify-space-around wrap>
        <v-flex class="text-xs-center">
          <a href="/api/googleauth"><img src="../../assets/auth/signin_google.png"></a>
        </v-flex>
        <v-flex class="text-xs-center">
          <a href="/api/facebookauth"><img src="../../assets/auth/signin_facebook.png"></a>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import FeaturePanel from './FeaturePanel.vue';

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

<style lang="scss">
  .parallax__image-container img {
    filter: brightness(60%);
  }

  .login-buttons {
    img {
      height: 40px;
    }
  }
</style>
