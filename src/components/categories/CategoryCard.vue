<template>
    <v-flex xs3 class="category">
        <v-card class="scrolling-card">
            <v-card-title primary-title :class="toolbarClass" @dragover="onDragOver" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
                <div class="headline full-width"><category-name :category="category" :editable="realCategory" ref="categoryName"></category-name></div>
            </v-card-title>
            <v-card-actions class="pt-0">
                <v-btn flat @click.native.stop="addCategory" class="primary--text">Add category</v-btn>
                <merge-dialog :category="category" v-if="realCategory && category.children.length === 0" @selectCategory="selectCategory"></merge-dialog>
            </v-card-actions>
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
    import {categoryType, CategoryDropTargetMixin} from './categoryDropTarget';
    import MergeDialog from './MergeDialog.vue';

    export default {
        mixins: [CategoryDropTargetMixin],
        props: ['category', 'categoryTree'],
        data() {
            return {
                mergeDialog: false,
            };
        },
        computed: {
            toolbarClass() {
                return {
                    'white': !this.dragOver,
                    'blue lighten-4': this.dragOver,
                    'pb-0': true,
                }
            },
            realCategory() {
                return this.category.id !== null;
            },
        },
        methods: {
            selectCategory(category) {
                this.$emit('selectCategory', category);
            },
            async addCategory() {
                const createdCategory = await this[actions.addCategory]({name: 'New Category', parentId: this.category.id});
                this.selectCategory(createdCategory);
            },
            focus() {
                this.$refs.categoryName.focusName();
            },
            ...mapActions('categories', [actions.addCategory]),
        },
        components: {
            Category,
            CategoryName,
            MergeDialog,
        },
    };
</script>

<style lang="scss">
    .category .full-width {
        width: 100%;
    }
</style>