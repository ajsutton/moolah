<template>
    <v-list-item :to="accountLink">
        <template v-slot:prepend>
            <v-icon :icon="walletIcon"></v-icon>
        </template>
        <v-list-item-title>
            {{ account.name }}
        </v-list-item-title>
        <template v-slot:append>
            <monetary-amount
                class="wallet-balance"
                :value="balance"
            ></monetary-amount>
        </template>
    </v-list-item>
</template>

<script setup>
import IconEyeOffOutline from '~icons/mdi/eyeOffOutline';
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

<style type="scss">
.wallet-balance {
    font-size: 0.8125rem;
}
</style>
