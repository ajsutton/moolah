<template>    
    <v-list-tile ripple>
        <v-list-tile-content>
            <v-list-tile-title>{{category.name}}</v-list-tile-title>
        </v-list-tile-content>
    </v-list-tile>
</template>
<script>
export default {
    props: ['category'],
}
</script>