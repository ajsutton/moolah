<template>
    <span>
        <monetary-amount :value="profit"></monetary-amount>
        <span :class="colour"
            ><v-icon :class="[colour, 'ml-4 mr-1']">{{ icon }}</v-icon
            >{{ profitPercent }}</span
        >
    </span>
</template>

<script>
import formatPercent from './formatPercent';
import MonetaryAmount from './MonetaryAmount.vue';

export default {
    props: {
        value: {
            type: Number,
            required: true,
        },
        balance: {
            type: Number,
            required: true,
        },
    },
    computed: {
        profit() {
            return this.value - this.balance;
        },
        profitPercent() {
            return formatPercent((this.profit / this.balance) * 100);
        },
        colour() {
            return this.profit >= 0 ? 'green--text' : 'red--text';
        },
        icon() {
            return this.profit >= 0 ? 'trending_up' : 'trending_down';
        },
    },
    components: {
        MonetaryAmount,
    },
};
</script>
