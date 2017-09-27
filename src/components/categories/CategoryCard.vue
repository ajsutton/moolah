<template>
    <v-flex xs3 class="category">
        <v-card flat class="scrolling-card">
            <v-toolbar card class="white">
                <v-toolbar-title class="body-2 grey--text">
                    <category-name :category="category" :editable="category.id !== null" ref="categoryNames"></category-name>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click.native.stop="addCategory">
                    <v-icon>add</v-icon>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>
            <v-list class="children">
                <category v-for="childCategory in category.children" :category="childCategory" :expanded="categoryTree.includes(childCategory)" :key="childCategory.id" @selectCategory="selectCategory"></category>
            </v-list>
        </v-card>
    </v-flex>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import {actions} from '../../store/categoryStore';
    import Category from './Category.vue';
    import CategoryName from './CategoryName.vue';

    export default {
        props: ['category', 'categoryTree'],
        methods: {
            selectCategory(category) {
                this.$emit('selectCategory', category);
            },
            async addCategory() {
                const createdCategory = await this[actions.addCategory]({name: 'New Category', parentId: this.category.id});
                this.selectCategory(createdCategory);
                this.$nextTick(() => {
                    this.$refs.categoryNames.find(categoryName => categoryName.category === createdCategory).focusName();
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