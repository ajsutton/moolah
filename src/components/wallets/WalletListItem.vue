<template>
    <v-list-item :to="accountLink">
        <v-list-item-title>
            <v-icon :icon="walletIcon"></v-icon>
            {{ account.name }}
            <monetary-amount
                class="float-right"
                :value="balance"
            ></monetary-amount>
        </v-list-item-title>
    </v-list-item>
</template>

<script setup>
import IconEyeOffOutline from '~icons/mdi/eyeOffOutline'
</script>

<script>
import MonetaryAmount from '../util/MonetaryAmount.vue';
import iconForType from './walletIcon';
import { accountValue } from '../../stores/accountsStore';

export default {
    components: {
        MonetaryAmount,
    },
    props: {
        account: {
            type: Object,
            required: true,
        },
        baseUrl: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
    },
    computed: {
        accountLink() {
            return `${this.baseUrl}/${encodeURIComponent(this.account.id)}/`;
        },
        walletIcon() {
            return this.account.hidden
                ? IconEyeOffOutline
                : this.icon || iconForType(this.account.type);
        },
        balance() {
            return accountValue(this.account);
        },
    },
};
</script>
