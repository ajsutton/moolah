<template>
    <v-btn text ripple @click.prevent.native="logout">Log out</v-btn>
</template>

<script>
import client from '../api/client';

export default {
    data() {
        return {};
    },
    methods: {
        logout() {
            client.logout().then(response => this.$emit('logOut'));
        },
    },
};
</script>
