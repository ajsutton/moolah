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
    import {actions} from '../../store/wallets/earmarksStore';
    import {rules} from '../validation';
    import {VForm} from 'vuetify';
    import DatePickerField from '../util/DatePickerField.vue';

    export default {
        props: ['earmark', 'dark'],
        data() {
            return {
                name: 'Unnamed earmark',
                savingsTarget: null,
                savingsStartDate: null,
                savingsEndDate: null,
                dialog: false,
                errorMessage: null,

                valid: true,

                rules: {
                    name: rules.walletName,
                },
            };
        },
        computed: {
            title() {
                return this.editing ? 'Edit Earmark' : 'Create Earmark';
            },
            icon() {
                return this.editing ? 'edit' : 'add';
            },
            action() {
                return this.editing ? 'Save' : 'Create';
            },
            editing() {
                return !!this.earmark;
            },
        },

        created() {
            this.syncFromEarmark(this.earmark);
        },

        watch: {
            earmark(newEarmark) {
                this.syncFromEarmark(newEarmark);
            },
        },

        methods: {
            async submit() {
                if (this.$refs.form.validate()) {
                    try {
                        if (this.editing) {
                            await this[actions.updateEarmark]({
                                id: this.earmark.id, patch: {
                                    name: this.name,
                                    type: this.type,
                                    savingsTarget: Math.round(this.savingsTarget * 100),
                                    savingsStartDate: this.savingsStartDate || undefined,
                                    savingsEndDate: this.savingsEndDate || undefined,
                                },
                            });
                        } else {
                            await this[actions.createEarmark]({
                                name: this.name,
                                type: this.type,
                                savingsTarget: Math.round(this.savingsTarget * 100),
                                savingsStartDate: this.savingsStartDate || undefined,
                                savingsEndDate: this.savingsEndDate || undefined,
                            });
                            this.syncFromEarmark(undefined);
                        }
                        this.dialog = false;
                    } catch (error) {
                        this.dialog = true;
                        this.errorMessage = error.message || error;
                    }
                }
            },
            syncFromEarmark(newEarmark) {
                if (newEarmark) {
                    this.name = newEarmark.name;
                    this.savingsTarget = newEarmark.savingsTarget / 100;
                    this.savingsStartDate = newEarmark.savingsStartDate;
                    this.savingsEndDate = newEarmark.savingsEndDate;
                } else {
                    this.name = 'Unnamed earmark';
                    this.savingsTarget = null;
                    this.savingsStartDate = null;
                    this.savingsEndDate = null;
                }
                this.errorMessage = null;
            },
            ...mapActions('earmarks', [actions.createEarmark, actions.updateEarmark])
        },
        components: {
            VForm,
            DatePickerField,
        },
    };
</script>
