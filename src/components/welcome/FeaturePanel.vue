<template>
    <v-col :cols="12" :sm="4">
        <v-card flat class="text-sm-center fill-height">
            <v-card-text>
                <v-icon size="large" :icon="icon" color="primary"></v-icon>
            </v-card-text>
            <v-card-text class="text-h5 font-weight-bold">{{
                headline
            }}</v-card-text>
            <v-card-text class="text-body-1"><slot /></v-card-text>
        </v-card>
    </v-col>
</template>

<script>
export default {
    props: ['icon', 'headline'],
};
</script>
