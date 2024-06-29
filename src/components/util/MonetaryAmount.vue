<template>
    <span :class="valueColor">{{ amount }}</span>
</template>

<script>
import formatMoney from './formatMoney';

export default {
    props: {
        value: {
            type: Number,
            required: true,
        },
        omitZeroCents: {
            type: Boolean,
            default: false,
        },
        invertColors: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: undefined,
        },
    },
    computed: {
        valueColor() {
            if (this.color !== undefined) {
                return "text-" + this.color;
            }
            return this.value >= 0 !== this.invertColors
                ? 'text-green'
                : 'text-red';
        },
        amount() {
            return formatMoney(this.value, this.omitZeroCents);
        },
    },
};
</script>
