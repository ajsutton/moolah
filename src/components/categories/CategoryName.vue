<template>
    <input type="text" :disabled="!editable" v-model="name">
</template>

<script>
    import {mapActions} from 'vuex';
    import {actions} from '../../store/categoryStore';

    export default {
        props: {
            category: Object,
            editable: Boolean,
        },
        computed: {
            name: {
                get() {
                    return this.category.name;
                },
                set(value) {
                    this[actions.updateCategory]({
                        id: this.category.id,
                        patch: {name: value},
                    });
                },
            },
        },
        methods: {
            ...mapActions('categories', [actions.updateCategory]),
        }
    };
</script>