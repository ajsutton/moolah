<template>
    <v-dialog v-model="dialog" persistent>
        <v-btn :dark="dark" icon slot="activator">
            <v-icon :title="title">{{icon}}</v-icon>
        </v-btn>
        <v-card>
            <v-card-title>{{title}}</v-card-title>
            <template v-if="errorMessage != null">
                <v-alert error :value="true">{{errorMessage}}</v-alert>
            </template>
            <v-card-text>
                <v-text-field label="Name" v-model="name" name="name" :rules="rules.name" required autofocus></v-text-field>
                <v-text-field label="Initial Balance" prefix="$" type="number" v-model="balance" name="balance" :rules="rules.balance" v-if="!editing"></v-text-field>
                <v-select
                        label="Account Type"
                        required
                        v-model="type"
                        :items="[{text: 'Bank Account', value: 'bank'}, {text: 'Credit Card', value: 'cc'}, {text: 'Asset', value: 'asset'}]"
                ></v-select>
                <small>*indicates required field</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="blue--text darken-1" flat @click.native="dialog = false">Close</v-btn>
                <v-btn class="blue--text darken-1" flat @click.native="submit">{{action}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import {mapActions} from 'vuex';
    import client from '../../api/client';
    import {actions} from '../../store/accountsStore';
    import {rules, isValid} from '../validation';

    export default {
        props: ['account', 'dark'],
        data() {
            return {
                name: 'Unnamed account',
                type: 'bank',
                balance: 0,
                dialog: false,
                errorMessage: null,

                rules: {
                    name: rules.accountName,
                    balance: rules.amount,
                },
            };
        },
        computed: {
            title() {
                return this.editing ? 'Edit Account' : 'Create Account'
            },
            icon() {
                return this.editing ? 'edit' : 'add';
            },
            action() {
                return this.editing ? 'Save' : 'Create';
            },
            editing() {
                return !!this.account;
            }
        },

        created() {
            this.syncFromAccount(this.account);
        },

        watch: {
            account(newAccount) {
                this.syncFromAccount(newAccount);
            }
        },

        methods: {
            async submit() {
                if (isValid(this.name, this.rules.name) && isValid(this.balance, this.rules.balance)) {
                    try {
                        if (this.editing) {
                            await this[actions.updateAccount]({id: this.account.id, patch: {name: this.name, type: this.type}});
                        } else {
                            await this[actions.createAccount]({name: this.name, type: this.type, balance: Math.round(this.balance * 100)});
                        }
                        this.dialog = false;
                        this.syncFromAccount(undefined);
                    } catch (error) {
                        this.dialog = true;
                        this.errorMessage = error.message || error;
                    }
                }
            },
            syncFromAccount(newAccount) {
                if (newAccount) {
                    this.balance = newAccount.balance;
                    this.type = newAccount.type;
                    this.name = newAccount.name;
                } else {
                    this.balance = 0;
                    this.type = 'bank';
                    this.name = 'Unnamed account';
                }
                this.errorMessage = null;
            },
            ...mapActions('accounts', [actions.createAccount, actions.updateAccount])
        },
    }
</script>
