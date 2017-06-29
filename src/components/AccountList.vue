<template>
  <v-list class="pt-0" dense>
    <v-divider></v-divider>
    <v-list-item v-for="account in accounts" :key="account.id">
      <v-list-tile avatar ripple>
        <v-list-tile-action>
          <v-icon light>{{ icon(account.type) }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ account.name }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-chip>{{account.balance | money}}</v-chip>
        </v-list-tile-action>
      </v-list-tile>
    </v-list-item>

    <v-list-item>
      <v-list-tile avatar ripple>
        <v-list-tile-action>
          <v-icon light>trending_up</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Net Worth</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-chip>{{networth | money}}</v-chip>
        </v-list-tile-action>
      </v-list-tile>
    </v-list-item>
  </v-list>
</template>

<script>
  import client from "@/api/client";
  export default {
    name: "AccountList",
    data () {
      return {
        accounts: []
      }
    },
    computed: {
      networth () {
        return this.accounts.reduce((networth, account) => networth + account.balance, 0);
      }
    },
    methods: {
      icon(type) {
        switch (type) {
          case 'cc':
            return 'credit_card';
          case 'asset':
            return 'home';
          default:
            return 'account_balance';
        }
      }
    },
    filters: {
      money(value) {
        return '$' + (value / 100).toFixed(2);
      }
    },
    created () {
      client.accounts().then(response => this.accounts = response.accounts)
    }
  }
</script>
