<template>
    <v-card>
        <v-card-title>Categories</v-card-title>
        <v-card-actions>
            <v-btn
                text
                @click.native.stop="addCategory(null)"
                class="primary--text"
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
                            :active.sync="selectedCategory"
                            :open.sync="opened"
                        ></v-treeview>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col :cols="12" :md="4" class="d-flex text-center">
                        <v-scroll-y-transition mode="out-in">
                            <div
                                v-if="!category"
                                class="title grey--text text--lighten-1 font-weight-light"
                                style="align-self: center;"
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
                                        <v-icon xLarge>folder_open</v-icon>
                                    </v-avatar>
                                    <h3 class="headline mb-2">
                                        {{ categoryName }}
                                    </h3>
                                    <category-name
                                        :category="category"
                                        :editable="true"
                                        ref="categoryName"
                                    ></category-name>
                                </v-card-text>
                                <v-card-actions class="pt-0">
                                    <v-btn
                                        text
                                        @click.native.stop="
                                            addCategory(category.id)
                                        "
                                        class="primary--text"
                                        >Add sub-category</v-btn
                                    >
                                    <merge-dialog
                                        :category="category"
                                        v-if="category.children.length === 0"
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
import { mapState, mapGetters, mapActions } from 'vuex';
import { actions } from '../../store/categoryStore';
import MergeDialog from './MergeDialog.vue';
import CategoryName from './CategoryName.vue';

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
        ...mapState('categories', ['categories']),
        ...mapGetters('categories', ['getCategory', 'getCategoryName']),
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
        ...mapActions('categories', [actions.addCategory]),
    },
    components: {
        CategoryName,
        MergeDialog,
    },
};
</script>
