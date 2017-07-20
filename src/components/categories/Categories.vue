<template>
    <v-card>
        <v-toolbar card class="white" prominent>
            <v-toolbar-title class="body-2 grey--text">Categories</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon
                   @click.native.stop="addCategory">
                <v-icon>add</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
            <v-list>
                <category v-for="category in categories" :category="category" :key="category.id"></category>
            </v-list>
    </v-card>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import {actions} from '../../store/categoryStore';
    import Category from './Category';

    export default {
        computed: {
            ...mapState('categories', ['categories']),
        },
        methods: {
            addCategory() {
                this[actions.addCategory]({name: 'New Category'});
            },
            ...mapActions('categories', [actions.addCategory])
        },
        components: {
            Category,
        },
    };
</script>
