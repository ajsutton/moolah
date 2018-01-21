<template>
    <v-dialog v-model="dialog" persistent>
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
                    <v-container>
                        <v-text-field label="Name" v-model="name" name="name" :rules="rules.name" required autofocus></v-text-field>
                        <v-text-field label="Initial Balance" prefix="$" type="number" v-model="balance" name="balance" :rules="rules.balance" v-if="!editing"></v-text-field>
                        <v-select
                                label="Account Type"
                                required
                                v-model="type"
                                :items="[{text: 'Bank Account', value: 'bank'}, {text: 'Credit Card', value: 'cc'}, {text: 'Asset', value: 'asset'}, {text: 'Earmarked Funds', value: 'earmark'}]"
                        ></v-select>

                        <div class="subheading mt-4">Savings goal</div>

                        <v-layout row wrap>
                            <v-flex sm4 xs12>
                                <v-text-field label="Savings target" prefix="$" type="number" v-model="savingsTarget" name="savingsTarget" :rules="rules.savingsTarget" clearable></v-text-field>
                            </v-flex>
                            <v-flex sm3 offset-sm1 xs12>
                                <date-picker-field label="Start" v-model="savingsStartDate" :optional="true"></date-picker-field>
                            </v-flex>
                            <v-flex sm3 offset-sm1 xs12>
                                <date-picker-field label="End" v-model="savingsEndDate" :optional="true"></date-picker-field>
                            </v-flex>
                        </v-layout>

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
    import {actions} from '../../store/accountsStore';
    import {rules} from '../validation';
    import {VForm} from 'vuetify';
    import DatePickerField from '../util/DatePickerField.vue';

    export default {
        props: ['account', 'dark'],
        data() {
            return {
                name: 'Unnamed account',
                type: 'bank',
                balance: 0,
                savingsTarget: null,
                savingsStartDate: null,
                savingsEndDate: null,
                dialog: false,
                errorMessage: null,

                valid: true,

                rules: {
                    name: rules.accountName,
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
                                    savingsTarget: Math.round(this.savingsTarget * 100),
                                    savingsStartDate: this.savingsStartDate,
                                    savingsEndDate: this.savingsEndDate,
                                },
                            });
                        } else {
                            await this[actions.createAccount]({
                                name: this.name,
                                type: this.type,
                                balance: Math.round(this.balance * 100),
                                savingsTarget: Math.round(this.savingsTarget * 100),
                                savingsStartDate: this.savingsStartDate,
                                savingsEndDate: this.savingsEndDate,
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
                    this.savingsTarget = newAccount.savingsTarget / 100;
                    this.savingsStartDate = newAccount.savingsStartDate;
                    this.savingsEndDate = newAccount.savingsEndDate;
                } else {
                    this.balance = 0;
                    this.type = 'bank';
                    this.name = 'Unnamed account';
                    this.savingsTarget = null;
                    this.savingsStartDate = null;
                    this.savingsEndDate = null;
                }
                this.errorMessage = null;
            },
            ...mapActions('accounts', [actions.createAccount, actions.updateAccount])
        },
        components: {
            VForm,
            DatePickerField,
        },
    };
</script>
