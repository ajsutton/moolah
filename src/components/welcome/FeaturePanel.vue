<template>
    <v-flex md4>
        <v-card flat class="text-xs-center">
            <v-card-text>
                <v-icon large>{{icon}}</v-icon>
            </v-card-text>
            <v-card-text class="headline">{{headline}}</v-card-text>
            <v-card-text><slot/></v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
export default {
    props: ['icon', 'headline']
}
</script>