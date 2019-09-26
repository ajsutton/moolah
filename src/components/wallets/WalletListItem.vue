<template>
    <v-list-item ripple :to="accountLink">
        <v-list-item-content>
            <v-list-item-title>
                <v-icon>{{ walletIcon }}</v-icon>
                {{ account.name }}
                <monetary-amount
                    class="float-right"
                    :value="account.balance"
                ></monetary-amount>
            </v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
import MonetaryAmount from "../util/MonetaryAmount.vue";
import iconForType from "./walletIcon";

export default {
    props: {
        account: {
            type: Object,
            required: true
        },
        baseUrl: {
            type: String,
            required: true
        },
        icon: {
            type: String
        }
    },
    computed: {
        accountLink() {
            return `${this.baseUrl}/${encodeURIComponent(this.account.id)}/`;
        },
        walletIcon() {
            return this.account.hidden
                ? "mdi-eye-off-outline"
                : this.icon || iconForType(this.account.type);
        }
    },
    components: {
        MonetaryAmount
    }
};
</script>
