<template>
  <v-navigation-drawer permanent clipped :mini-variant.sync="mini" v-model="drawer">
    <v-list class="pa-0">
      <v-list-item>
        <v-list-tile avatar tag="div">
          <v-list-tile-avatar v-if="profile.picture">
            <img :src="profile.picture"/>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{profile.givenName}} {{profile.familyName}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon @click.native.stop="mini = !mini">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list-item>
    </v-list>
    <account-list></account-list>
  </v-navigation-drawer>
</template>

<script>
  import AccountList from '@/components/AccountList';
  export default {
    props: ['profile'],
    data() {
      return {
        mini: false,
        drawer: true,
      };
    },
    components: {
      AccountList
    }
  }
</script>
