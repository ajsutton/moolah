<template>
    <v-dialog v-model="open" width="50%">
        <v-btn flat class="red--text" slot="activator">Delete&hellip;</v-btn>
        <v-card>
            <v-card-title>
                <span class="headline">Delete Category {{categoryName}}</span>
            </v-card-title>
            <v-card-text>
                <category-selector label="Replace with" v-model="replacement" :exclude="[category]"></category-selector>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="primary--text" flat @click.native="open = false">Cancel</v-btn>
                <v-btn class="red--text" flat @click.native="doDelete">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import {actions} from '../../store/categoryStore';
    import CategorySelector from './CategorySelector.vue';

    export default {
        props: ['category'],
        data() {
            return {
                open: false,
                replacement: null,
            }
        },
        computed: {
            categoryName() {
                return this.$store.getters['categories/getCategoryName'](this.category.id);
            },
            ...mapGetters('categories', ['getCategory']),
        },
        methods: {
            async doDelete() {
                this.open = false;
                this.$emit('selectCategory', this.getCategory(this.category.parentId) || {id: null});
                await this[actions.deleteCategory]({id: this.category.id, replaceWith: this.replacement});
            },
            ...mapActions('categories', [actions.deleteCategory]),
        },
        components: {
            CategorySelector,
        }
    }
</script>