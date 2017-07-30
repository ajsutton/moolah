<template>
    <v-menu
            lazy
            :close-on-content-click="true"
            v-model="dateMenu"
            offset-y
            full-width
            :nudge-right="40"
            max-width="290px"
            transition="scale-transition"
    >
        <v-text-field
                slot="activator"
                label="Date"
                :value="value"
                @input="onInput"
                readonly
        ></v-text-field>
        <v-date-picker
                :value="value"
                @input="onInput"
                no-title scrollable actions>
        </v-date-picker>
    </v-menu>
</template>

<script>
    export default {
        props: ['value'],
        data() {
            return {
                dateMenu: false,
            }
        },

        methods: {
            onInput(value) {
                this.$emit('input', value);
            },
        },
    };
</script>
