<template>
    <v-col :cols="12" :sm="4">
        <v-card flat class="text-xs-center fill-height">
            <v-card-text>
                <v-icon large>{{ icon }}</v-icon>
            </v-card-text>
            <v-card-text class="headline">{{ headline }}</v-card-text>
            <v-card-text><slot /></v-card-text>
        </v-card>
    </v-col>
</template>

<script>
export default {
    props: ["icon", "headline"]
};
</script>
