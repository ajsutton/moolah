<template>
  <v-dialog v-model="dialog">
    <v-btn dark icon slot="activator">
      <v-icon title="Add account">add</v-icon>
    </v-btn>
    <v-card>
    <v-card-title>Create Account</v-card-title>
      <template v-if="errorMessage != null">
        <v-alert error :value="true">{{errorMessage}}</v-alert>
      </template>
        <v-card-text>
          <v-text-field label="Name" v-model="name" name="name" :rules="errorsAsRules('name')" v-validate="'required'"></v-text-field>
          <v-text-field label="Initial Balance" type="number" v-model="balance" name="balance" :rules="errorsAsRules('balance')" v-validate="'decimal:2'"></v-text-field>
          <v-select
            label="Account Type"
            required
            v-model="type"
            :items="[{text: 'Bank Account', value: 'bank'}, {text: 'Credit Card', value: 'cc'}, {text: 'Asset', value: 'asset'}]"
          ></v-select>
          <small>*indicates required field</small>
        </v-card-text>
        <v-btn class="blue--text darken-1" flat @click.native="dialog = false">Close</v-btn>
        <v-btn class="blue--text darken-1" flat @click.native="create">Create</v-btn>
    </v-card>
  </v-dialog>
</template>

<script>
  import client from '@/api/client';
  export default {
    data() {
      return {
        name: '',
        type: 'bank',
        balance: 0,
        dialog: false,
        errorMessage: null,

        rules: {
          name: [],
          email: []
        },
      };
    },
    computed: {
    },

    methods: {
      errorsAsRules(name) {
        return [()=>this.verrors.has(name) ? this.verrors.first(name) : true];
      },
      async create() {
        const valid = await this.$validator.validateAll();
        if (valid) {
          client.createAccount({name: this.name, type: this.type, balance: Math.round(this.balance * 100)})
            .then(() => this.dialog = false)
            .catch(error => this.errorMessage = error.message || error);
        }
      },
    },
  }
</script>
