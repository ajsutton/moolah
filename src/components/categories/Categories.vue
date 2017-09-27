<template>
    <v-card class="categories">
        <v-layout row>
            <v-flex xs3 v-for="selectedCategory in categoryTree" :key="selectedCategory.id" class="category">
                <v-card flat class="scrolling-card" ref="categoryCards">
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
                    <v-list class="children">
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
            async addCategory(parent) {
                const createdCategory = await this[actions.addCategory]({name: 'New Category', parentId: parent.id});
                this.selectCategory(createdCategory);
            },
            selectCategory(category) {
                this.selectedCategory = category;
                this.$nextTick(() => {
                    this.$refs.categoryCards[this.$refs.categoryCards.length - 1].scrollIntoView();
                });
            },
            ...mapActions('categories', [actions.addCategory]),
        },
        components: {
            Category,
            CategoryName,
        },
    };
</script>

<style lang="scss">
    .categories {
        overflow-x: auto;

        .category {
            min-width: 25%;
        }

        .children {
            overflow-y: auto;
            max-height: calc(100vh - 64px - 92px);
        }
    }
</style>
