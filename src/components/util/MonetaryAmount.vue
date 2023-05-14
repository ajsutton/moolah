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
                return this.color + '--text';
            }
            return this.value >= 0 !== this.invertColors
                ? 'green--text'
                : 'red--text';
        },
        amount() {
            return formatMoney(this.value, this.omitZeroCents);
        },
    },
};
</script>
