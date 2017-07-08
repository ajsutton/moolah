<template>
    <div>Edit Transaction</div>
</template>
<script>
import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';

export default {
    computed: {
        ...mapGetters('transactions', {
            transaction: 'selectedTransaction',
        })
    }
};
</script>