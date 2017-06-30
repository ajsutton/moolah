<template>
    <span :class="colour">{{amount}}</span>
</template>

<script>
    export default {
        props: ['value'],
        computed: {
            colour() {
                return this.value >= 0 ? 'green--text' : 'red--text';
            },
            amount() {
                return '$' + (this.value / 100).toFixed(2);
            }
        },
    }
</script>
