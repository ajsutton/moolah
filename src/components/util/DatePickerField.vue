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
                v-on:keyup.up="incrementDate"
                v-on:keyup.down="decrementDate"
        ></v-text-field>
        <v-date-picker
                :value="value"
                @input="onInput"
                no-title scrollable actions>
        </v-date-picker>
    </v-menu>
</template>

<script>
    import addDays from 'date-fns/add_days';
    import {formatDate} from '../../api/apiFormats';

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

            incrementDate() {
                this.$emit('input', formatDate(addDays(this.value, 1)));
            },

            decrementDate() {
                this.$emit('input', formatDate(addDays(this.value, -1)));
            },
        },
    };
</script>
