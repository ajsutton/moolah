import {mapState, mapGetters, mapActions} from 'vuex';
import {actions} from '../../store/categoryStore';

export const categoryType = 'application/x-moolah-category';

export const CategoryDropTargetMixin = {
    data() {
        return {
            dragOver: 0,
        };
    },
    computed: {
        ...mapGetters('categories', ['getCategory']),
    },
    methods: {
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
};