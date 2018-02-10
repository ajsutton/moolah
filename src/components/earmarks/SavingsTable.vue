<template>
</template>

<script>
    import SavingsGoalMixin from './SavingsGoalMixin';
    import MonetaryAmount from '../util/MonetaryAmount.vue';

    export default {
        mixins: [
            SavingsGoalMixin,
        ],
        components: {
            MonetaryAmount,
        },
    };
</script>
