<template>
    <v-card>
        <v-layout row>
            <v-flex xs3 v-for="selectedCategory in categoryTree" :key="selectedCategory.id">
                <v-card flat>
                    <v-toolbar card class="white">
                        <v-toolbar-title class="body-2 grey--text">
                            <category-name :category="selectedCategory" :editable="selectedCategory.id !== null"></category-name>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click.native.stop="addCategory(selectedCategory)">
                            <v-icon>add</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <v-list>
                        <category v-for="category in selectedCategory.children" :category="category" :expanded="categoryTree.includes(category)" :key="category.id" @selectCategory="selectCategory"></category>
                    </v-list>
                </v-card>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import {actions} from '../../store/categoryStore';
    import Category from './Category.vue';
    import CategoryName from './CategoryName.vue';

    export default {
        data() {
            return {
                selectedCategory: null,
            };
        },
        computed: {
            categoryTree() {
                const root = {id: null, name: 'Categories', children: this.categories};
                if (this.selectedCategory === null) {
                    return [root];
                } else {
                    const tree = [this.selectedCategory];
                    let category = this.selectedCategory;
                    while (category && category.parentId !== null) {
                        category = this.getCategory(category.parentId);
                        tree.unshift(category);
                    }
                    tree.unshift(root);
                    return tree;
                }
            },
            ...mapState('categories', ['categories']),
            ...mapGetters('categories', ['getCategory']),
        },
        methods: {
            addCategory(parent) {
                this[actions.addCategory]({name: 'New Category', parentId: parent.id});
            },
            selectCategory(category) {
                this.selectedCategory = category;
            },
            ...mapActions('categories', [actions.addCategory]),
        },
        components: {
            Category,
            CategoryName,
        },
    };
</script>