<template>
    <v-container class="categories">
        <v-layout row>
            <category-card v-for="category in categoryTree" :key="category.id" :category="category" :categoryTree="categoryTree" @selectCategory="selectCategory" ref="categoryCards"></category-card>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import CategoryCard from './CategoryCard.vue';

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
            selectCategory(category) {
                this.selectedCategory = category.id !== null ? category : null;
                this.$nextTick(() => {
                    this.$refs.categoryCards[this.$refs.categoryCards.length - 1].focus();
                });
            },
        },
        components: {
            CategoryCard,
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
            max-height: calc(100vh - 64px - 180px);
        }
    }
</style>
