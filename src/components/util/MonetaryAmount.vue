<template>
    <span :class="colour">{{ amount }}</span>
</template>

<script>
import formatMoney from "./formatMoney";

export default {
    props: {
        value: {
            type: Number,
            required: true
        },
        omitZeroCents: {
            type: Boolean,
            default: false
        },
        invertColors: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        colour() {
            return this.value >= 0 !== this.invertColors
                ? "green--text"
                : "red--text";
        },
        amount() {
            return formatMoney(this.value, this.omitZeroCents);
        }
    }
};
</script>
