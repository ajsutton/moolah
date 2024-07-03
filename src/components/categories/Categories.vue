<template>
    <v-card>
        <v-card-title>Categories</v-card-title>
        <v-card-actions>
            <v-btn
                variant="text"
                class="text-primary"
                @click.stop="addCategory(null)"
            >
                Add category
            </v-btn>
        </v-card-actions>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col :cols="12" :sm="6" :md="3">
                        <v-treeview
                            activatable
                            :items="categories"
                            item-disabled="disabled"
                            item-title="name"
                            item-value="id"
                            active-strategy="single-individual"
                            v-model:activated="selectedCategory"
                            v-model:open="opened"
                        ></v-treeview>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col :cols="12" :md="4" class="d-flex text-center">
                        <v-scroll-y-transition mode="out-in">
                            <div
                                v-if="!category"
                                class="text-h6 text-grey-lighten-1 font-weight-light"
                                style="align-self: center"
                            >
                                Select a Category
                            </div>
                            <v-card
                                v-else
                                :key="category.id"
                                class="pt-6 mx-auto"
                                flat
                                max-width="400"
                            >
                                <v-card-text>
                                    <v-avatar size="88">
                                        <v-icon size="x-large"
                                            >folder_open</v-icon
                                        >
                                    </v-avatar>
                                    <h3 class="text-h5 mb-2">
                                        {{ categoryName }}
                                    </h3>
                                    <category-name
                                        ref="categoryName"
                                        :category="category"
                                        :editable="true"
                                    ></category-name>
                                </v-card-text>
                                <v-card-actions class="pt-0">
                                    <v-btn
                                        variant="text"
                                        class="text-primary"
                                        @click.stop="addCategory(category.id)"
                                        >Add sub-category</v-btn
                                    >
                                    <merge-dialog
                                        v-if="category.children.length === 0"
                                        :category="category"
                                        @selectCategory="selectCategory"
                                    ></merge-dialog>
                                </v-card-actions>
                            </v-card>
                        </v-scroll-y-transition>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import MergeDialog from './MergeDialog.vue';
import CategoryName from './CategoryName.vue';
import { useCategoryStore, actions } from '../../stores/categoryStore';
import { VTreeview } from 'vuetify/labs/VTreeview';

export default {
    data() {
        return {
            selectedCategory: [],
            opened: [],
        };
    },
    computed: {
        category() {
            return this.selectedCategory &&
                this.selectedCategory.length > 0 &&
                this.selectedCategory[0] !== null
                ? this.getCategory(this.selectedCategory[0])
                : undefined;
        },
        categoryName() {
            return this.getCategoryName(this.category.id);
        },
        ...mapState(useCategoryStore, [
            'categories',
            'getCategory',
            'getCategoryName',
        ]),
    },
    methods: {
        async addCategory(parentId) {
            const createdCategory = await this[actions.addCategory]({
                name: 'New Category',
                parentId,
            });

            if (parentId) {
                this.opened.push(parentId);
            }
            this.selectCategory(createdCategory);
        },
        selectCategory(category) {
            this.selectedCategory = [category.id];
        },
        ...mapActions(useCategoryStore, [actions.addCategory]),
    },
    components: {
        CategoryName,
        MergeDialog,
        VTreeview,
    },
};
</script>
