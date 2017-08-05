<template>
    <span :class="colour">{{amount}}</span>
</template>

<script>
    import formatMoney from './formatMoney';

    export default {
        props: ['value'],
        computed: {
            colour() {
                return this.value >= 0 ? 'green--text' : 'red--text';
            },
            amount() {
                return formatMoney(this.value);
            }
        },
    }
</script>
