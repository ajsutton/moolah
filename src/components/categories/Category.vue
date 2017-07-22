<template>
    <v-list-tile :class="mainClass" @click.native.prevent="selectCategory">
        <v-list-tile-content>
            <v-list-tile-title>{{category.name}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <v-icon v-badge="badge" class="secondary--after">keyboard_arrow_right</v-icon>
        </v-list-tile-action>
    </v-list-tile>
</template>
<script>
    export default {
        name: 'CategoryListItem',
        props: ['category', 'expanded'],
        computed: {
            hasChildren() {
                return this.category.children.length > 0;
            },
            mainClass() {
                return this.expanded ? 'blue lighten-2' : '';
            },
            badge() {
                return {value: this.category.children.length, left: true, bottom: true, visible: this.hasChildren};
            }
        },
        methods: {
            selectCategory() {
                this.$emit('selectCategory', this.category);
            }
        }
    }
</script>

<style scoped>
    i.badge::after {
        top: initial;
        bottom: 0;
    }
</style>