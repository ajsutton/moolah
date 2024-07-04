<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template #activator="{ props }">
            <v-btn
                icon
                v-bind="props"
                :variant="iconVariant"
                :density="iconDensity"
            >
                <v-icon :title="title" :icon="icon"></v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-card-title>{{ title }}</v-card-title>
                <template v-if="errorMessage != null">
                    <v-alert type="error">{{ errorMessage }}</v-alert>
                </template>
                <v-card-text>
                    <v-container fluid>
                        <v-text-field
                            v-model="name"
                            label="Name"
                            name="name"
                            :rules="rules.name"
                            required
                            autofocus
                        ></v-text-field>
                        <v-text-field
                            v-if="!editing"
                            v-model="balance"
                            label="Initial Balance"
                            prefix="$"
                            type="text"
                            name="balance"
                            :rules="rules.balance"
                        ></v-text-field>
                        <v-select
                            v-model="type"
                            label="Account Type"
                            required
                            :items="[
                                { title: 'Bank Account', value: 'bank' },
                                { title: 'Credit Card', value: 'cc' },
                                { title: 'Asset', value: 'asset' },
                                { title: 'Investment', value: 'investment' },
                            ]"
                        ></v-select>

                        <v-checkbox
                            v-if="canHide"
                            v-model="hidden"
                            label="Closed"
                        ></v-checkbox>
                        <small>*indicates required field</small>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="text-primary"
                        variant="text"
                        @click="dialog = false"
                        >Close</v-btn
                    >
                    <v-btn
                        class="text-primary"
                        variant="text"
                        @click="submit"
                        >{{ action }}</v-btn
                    >
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script setup>
import IconAdd from '~icons/mdi/add';
import IconEdit from '~icons/mdi/edit';
</script>

<script>
import { mapActions } from 'pinia';
import { actions, useAccountsStore } from '../../stores/accountsStore';
import { rules } from '../validation';
import parseMoney from '../util/parseMoney';
import formatMoney from '../util/formatMoney';

export default {
    props: ['account', 'iconDensity', 'iconVariant'],
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
            return this.editing ? IconEdit : IconAdd;
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

    watch: {
        account(newAccount) {
            this.syncFromAccount(newAccount);
        },
    },

    created() {
        this.syncFromAccount(this.account);
    },

    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    if (this.editing) {
                        await this[actions.updateAccount]({
                            id: this.account.id,
                            patch: {
                                name: this.name,
                                type: this.type,
                                hidden: this.hidden,
                            },
                        });
                    } else {
                        await this[actions.createAccount]({
                            name: this.name,
                            type: this.type,
                            balance: parseMoney(this.balance),
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
                this.balance = formatMoney(newAccount.balance, false, true);
                this.type = newAccount.type;
                this.name = newAccount.name;
                this.hidden = newAccount.hidden;
            } else {
                this.balance = formatMoney(0, false, true);
                this.type = 'bank';
                this.name = 'Unnamed account';
                this.hidden = false;
            }
            this.errorMessage = null;
        },
        ...mapActions(useAccountsStore, [
            actions.createAccount,
            actions.updateAccount,
        ]),
    },
};
</script>
