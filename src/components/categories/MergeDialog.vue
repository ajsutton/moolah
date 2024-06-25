<template>
    <v-dialog v-model="open" width="50%">
        <template #activator="{ on }">
            <v-btn text class="red--text" v-on="on">Delete&hellip;</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">Delete Category {{ categoryName }}</span>
            </v-card-title>
            <v-card-text>
                <category-selector
                    v-model="replacement"
                    label="Replace with"
                    :exclude="[category]"
                ></category-selector>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="primary--text" text @click.native="open = false"
                    >Cancel</v-btn
                >
                <v-btn class="red--text" text @click.native="doDelete"
                    >Delete</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { useCategoryStore, actions } from '../../stores/categoryStore';
import CategorySelector from './CategorySelector.vue';

export default {
    props: ['category'],
    data() {
        return {
            open: false,
            replacement: null,
        };
    },
    computed: {
        categoryName() {
            return this.$store.getters['categories/getCategoryName'](
                this.category.id
            );
        },
        ...mapState(useCategoryStore, ['getCategory']),
    },
    methods: {
        async doDelete() {
            this.open = false;
            this.$emit(
                'selectCategory',
                this.getCategory(this.category.parentId) || { id: null }
            );
            await this[actions.deleteCategory]({
                id: this.category.id,
                replaceWith: this.replacement,
            });
        },
        ...mapActions(useCategoryStore, [actions.deleteCategory]),
    },
    components: {
        CategorySelector,
    },
};
</script>
