<template>
    <v-list-tile :class="mainClass" @click.native.prevent="selectCategory" draggable="true" 
                 @dragstart="onDragStart" @dragend="onDragEnd" @dragover="onDragOver" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
        <v-list-tile-content>
            <v-list-tile-title>{{category.name}}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
            <v-icon v-badge="badge" class="secondary--after">keyboard_arrow_right</v-icon>
        </v-list-tile-action>
    </v-list-tile>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import {actions} from '../../store/categoryStore';

    const categoryType = 'application/x-moolah-category';
    export default {
        name: 'CategoryListItem',
        props: ['category', 'expanded'],
        data() {
            return {
                dragging: false,
                dragOver: 0,
            };
        },
        computed: {
            hasChildren() {
                return this.category.children.length > 0;
            },
            mainClass() {
                return {
                    category: true,
                    'blue lighten-2': this.expanded,
                    'blue lighten-4': this.dragOver,
                    dragging: this.dragging,
                }
            },
            badge() {
                return {value: this.category.children.length, left: true, bottom: true, visible: this.hasChildren};
            },
            ...mapGetters('categories', ['getCategory']),
        },
        methods: {
            selectCategory() {
                this.$emit('selectCategory', this.category);
            },
            onDragStart(e) {
                this.dragging = true;
                e.dataTransfer.setData(categoryType, this.category.id);
            },
            onDragEnd(e) {
                this.dragging = false;
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
            ...mapActions('categories', [actions.updateCategory]),
        }
    }
</script>

<style lang="scss">
    .category {
        i.badge::after {
            top: initial;
            bottom: 0;
        }

        .dragging {
            opacity: 0.4;
        }
    }
</style>