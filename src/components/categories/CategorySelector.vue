<template>
    <v-select
            v-bind:items="flattenedCategories"
            item-text="name"
            item-value="id"
            v-model="valueProxy"
            :label="label"
            no-data-text="No matching categories"
            autocomplete
    ></v-select>
</template>

<script>
    import {mapState} from 'vuex';

    export default {
        props: {
            value: String,
            label: {
                type: String,
                'default': 'Category',
            },
            exclude: {
                type: Array,
                'default': [],
            },
        },
        computed: {
            valueProxy: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit('input', value === 'no-category-selected' ? undefined : value);
                }
            },
            flattenedCategories() {
                const name = [];
                const categories = [];
                const addCategory = category => {
                    name.push(category.name);
                    if (!this.exclude.includes(category)) {
                        categories.push({id: category.id, name: name.join(':')});
                    }
                    category.children.forEach(addCategory);
                    name.pop();
                };
                this.categories.forEach(addCategory);
                return categories;
            },
            ...mapState('categories', ['categories'])
        },
    };
</script>
