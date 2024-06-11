<template>
    <span>
        <monetary-amount :value="value" :color="valueColor"></monetary-amount>
        <span v-if="percent != undefined" :class="percentColor"
            ><v-icon :class="[percentColor, 'ml-4 mr-1']">{{ icon }}</v-icon
            >{{ formattedPercent }}</span
        >
    </span>
</template>

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
            return this.percent >= 0 ? 'green--text' : 'red--text';
        },
        icon() {
            return this.percent >= 0 ? 'trending_up' : 'trending_down';
        },
    },
};
</script>
