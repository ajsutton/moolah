<template>
    <v-flex xs3 class="category">
        <v-card flat class="scrolling-card">
            <v-toolbar card :class="toolbarClass">
                <v-toolbar-title class="body-2 gray--text" @dragover="onDragOver" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
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

    const categoryType = 'application/x-moolah-category';
    export default {
        props: ['category', 'categoryTree'],
        data() {
            return {
                dragOver: 0,
            };
        },
        computed: {
            toolbarClass() {
                return {
                    'white': !this.dragOver,
                    'blue lighten-4': this.dragOver,
                }
            },
            ...mapGetters('categories', ['getCategory']),
        },
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

            onDragEnter(e) {
                if (e.dataTransfer.types.includes(categoryType)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.dragOver === 0) {
                        this.$emit('selectCategory', this.category);
                    }
                    this.dragOver++;
                }
            },
            onDragOver(e) {
                if (e.dataTransfer.types.includes(categoryType)) {
                    e.dataTransfer.dropEffect = "move";
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            onDragLeave(e) {
                if (e.dataTransfer.types.includes(categoryType)) {
                    this.dragOver = Math.max(0, this.dragOver - 1);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            onDrop(e) {
                this.dragOver = 0;
                if (e.dataTransfer.types.includes(categoryType)) {
                    const droppedCategory = this.getCategory(e.dataTransfer.getData(categoryType));
                    if (droppedCategory.id === this.category.id) {
                        return;
                    }
                    e.stopPropagation();
                    this[actions.updateCategory]({
                        id: droppedCategory.id,
                        patch: {
                            parentId: this.category.id,
                        },
                    });
                }
            },
            ...mapActions('categories', [actions.addCategory, actions.updateCategory]),
        },
        components: {
            Category,
            CategoryName,
        },
    };
</script>