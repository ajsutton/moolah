<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <v-btn :dark="dark" icon slot="activator">
            <v-icon :title="title">{{icon}}</v-icon>
        </v-btn>
        <v-card>
            <v-form v-model="valid" ref="form" lazy-validation>
                <v-card-title>{{title}}</v-card-title>
                <template v-if="errorMessage != null">
                    <v-alert error :value="true">{{errorMessage}}</v-alert>
                </template>
                <v-card-text>
                    <v-container fluid>
                        <v-text-field label="Name" v-model="name" name="name" :rules="rules.name" required autofocus></v-text-field>
                        <v-text-field label="Initial Balance" prefix="$" type="number" v-model="balance" name="balance" :rules="rules.balance" v-if="!editing"></v-text-field>
                        <v-select
                                label="Account Type"
                                required
                                v-model="type"
                                :items="[{text: 'Bank Account', value: 'bank'}, {text: 'Credit Card', value: 'cc'}, {text: 'Asset', value: 'asset'}, {text: 'Earmarked Funds', value: 'earmark'}]"
                        ></v-select>

                        <v-checkbox label="Closed" v-model="hidden" v-if="canHide"></v-checkbox>
                        <small>*indicates required field</small>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="blue--text darken-1" flat @click.native="dialog = false">Close</v-btn>
                    <v-btn class="blue--text darken-1" flat @click.native="submit">{{action}}</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script>
    import {mapActions} from 'vuex';
    import client from '../../api/client';
    import {actions} from '../../store/wallets/accountsStore';
    import {rules} from '../validation';
    import {VForm, VCheckbox} from 'vuetify';
    import DatePickerField from '../util/DatePickerField.vue';

    export default {
        props: ['account', 'dark'],
        data() {
            return {
                name: 'Unnamed account',
                type: 'bank',
                balance: 0,
                hidden: false,
                dialog: false,
                errorMessage: null,

                valid: true,

                rules: {
                    name: rules.walletName,
                    balance: rules.amount,
                },
            };
        },
        computed: {
            title() {
                return this.editing ? 'Edit Account' : 'Create Account';
            },
            icon() {
                return this.editing ? 'edit' : 'add';
            },
            action() {
                return this.editing ? 'Save' : 'Create';
            },
            editing() {
                return !!this.account;
            },
            canHide() {
                return this.editing && (this.account.balance === 0 || this.hidden);
            },
        },

        created() {
            this.syncFromAccount(this.account);
        },

        watch: {
            account(newAccount) {
                this.syncFromAccount(newAccount);
            },
        },

        methods: {
            async submit() {
                if (this.$refs.form.validate()) {
                    try {
                        if (this.editing) {
                            await this[actions.updateAccount]({
                                id: this.account.id, patch: {
                                    name: this.name,
                                    type: this.type,
                                    hidden: this.hidden,
                                },
                            });
                        } else {
                            await this[actions.createAccount]({
                                name: this.name,
                                type: this.type,
                                balance: Math.round(this.balance * 100),
                            });
                            this.syncFromAccount(undefined);
                        }
                        this.dialog = false;
                    } catch (error) {
                        this.dialog = true;
                        this.errorMessage = error.message || error;
                    }
                }
            },
            syncFromAccount(newAccount) {
                if (newAccount) {
                    this.balance = newAccount.balance / 100;
                    this.type = newAccount.type;
                    this.name = newAccount.name;
                    this.hidden = newAccount.hidden;
                } else {
                    this.balance = 0;
                    this.type = 'bank';
                    this.name = 'Unnamed account';
                    this.hidden = false;
                }
                this.errorMessage = null;
            },
            ...mapActions('accounts', [actions.createAccount, actions.updateAccount])
        },
        components: {
            VForm,
            DatePickerField,
            VCheckbox,
        },
    };
</script>
