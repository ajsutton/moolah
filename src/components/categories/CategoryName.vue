<template>
    <v-text-field
        ref="nameField"
        v-model="name"
        :disabled="!editable"
        :label="editable ? 'Name' : null"
        class="category-name"
    ></v-text-field>
</template>

<script>
import { mapActions } from 'vuex';
import { actions } from '../../store/categoryStore';

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
                    patch: { name: value },
                });
            },
        },
    },
    methods: {
        focusName() {
            this.$refs.nameField.$refs.input.focus();
            this.$refs.nameField.$refs.input.select();
        },
        ...mapActions('categories', [actions.updateCategory]),
    },
};
</script>

<style lang="scss">
.category-name.input-group--disabled .input-group__details:before {
    background-image: none !important;
}
</style>
