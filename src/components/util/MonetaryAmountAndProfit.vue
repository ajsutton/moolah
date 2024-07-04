<template>
    <span>
        <monetary-amount :value="value" :color="valueColor"></monetary-amount>
        <span v-if="percent != undefined" :class="percentColor"
            ><v-icon :class="[percentColor, 'ml-4 mr-1']" :icon="icon"></v-icon
            >{{ formattedPercent }}</span
        >
    </span>
</template>

<script setup>
import IconTrendingUp from '~icons/mdi/trendingUp';
import IconTrendingDown from '~icons/mdi/trendingDown';
</script>

<script>
import formatPercent from './formatPercent';
import MonetaryAmount from './MonetaryAmount.vue';

export default {
    components: {
        MonetaryAmount,
    },
    props: {
        value: {
            type: Number,
            required: true,
        },
        percent: {
            type: Number,
            required: false,
        },
        valueColor: {
            type: String,
            default: undefined,
        },
    },
    computed: {
        formattedPercent() {
            return formatPercent(this.percent);
        },
        percentColor() {
            return this.percent >= 0 ? 'text-green' : 'text-red';
        },
        icon() {
            return this.percent >= 0 ? IconTrendingUp : IconTrendingDown;
        },
    },
};
</script>
