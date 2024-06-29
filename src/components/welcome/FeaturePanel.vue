<template>
    <v-col :cols="12" :sm="4">
        <v-card flat class="text-sm-center fill-height">
            <v-card-text>
                <v-icon size="large">{{ icon }}</v-icon>
            </v-card-text>
            <v-card-text class="text-h5">{{ headline }}</v-card-text>
            <v-card-text><slot /></v-card-text>
        </v-card>
    </v-col>
</template>

<script>
export default {
    props: ['icon', 'headline'],
};
</script>
