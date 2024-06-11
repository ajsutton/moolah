<template>
    <v-card :elevation="0">
        <v-card-subtitle class="pb-1">{{ label }}</v-card-subtitle>
        <v-card-text
            ><monetary-amount-and-profit
                class="text-h5"
                :value="value"
                :value-color="valueColor"
                :percent="percent"
            ></monetary-amount-and-profit
        ></v-card-text>
    </v-card>
</template>
<script>
import MonetaryAmountAndProfit from '../util/MonetaryAmountAndProfit.vue';

export default {
    components: {
        MonetaryAmountAndProfit,
    },
    props: {
        label: {
            type: String,
            required: true,
        },
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
            required: false,
            default: undefined,
        },
    },
};
</script>
