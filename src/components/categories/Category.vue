<template>
    <v-list-group :value="expanded" @click="expanded = !expanded" class="category-list-item">
        <v-list-tile slot="item">
            <v-list-tile-content>
                <v-list-tile-title>{{category.name}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="hasChildren">
                <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
        </v-list-tile>
        <category-list-item v-for="subCategory in category.children" v-bind:key="subCategory.id" :category="subCategory"></category-list-item>
    </v-list-group>
</template>
<script>
    export default {
        name: 'CategoryListItem',
        props: ['category'],
        data() {
            return {
                expanded: false,
            }
        },
        computed: {
            hasChildren() {
                return this.category.children.length > 0;
            }
        }
    }
</script>

<style>
    .category-list-item .list--group__header--active .list__tile {
        background-color: transparent !important;
    }
    .category-list-item .list--group .list--group .list__tile {
        padding-left: 144px;
    }
</style>
