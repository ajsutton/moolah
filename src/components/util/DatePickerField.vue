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
                :label="label"
                v-model="textValue"
                :error-messages="errorMessages"
                :clearable="optional"
                @blur="onBlur"
                v-on:keyup.up="incrementDate"
                v-on:keyup.down="decrementDate"
        ></v-text-field>
        <v-date-picker
                :value="value"
                @input="onInput"
                no-title scrollable>
        </v-date-picker>
    </v-menu>
</template>

<script>
    import addDays from 'date-fns/add_days';
    import parseDate from 'date-fns/parse';
    import {formatDate} from '../../api/apiFormats';

    export default {
        props: {
            value: String,
            optional: {
                type: Boolean,
                'default': false
            },
            label: {
                type: String,
                'default': 'Date',
            },
        },
        data() {
            return {
                invalidText: null,
                dateMenu: false,
                errorMessages: [],
            }
        },

        computed: {
            textValue: {
                get() {
                    return this.invalidText !== null ? this.invalidText : this.value;
                },
                set(value) {
                    if (this.optional && (value === undefined || value === null || value === '')) {
                        this.invalidText = null;
                        this.errorMessages = [];
                        this.onInput(undefined);
                    } else {
                        const parsedValue = parseDate(value);
                        if (!isNaN(parsedValue) && formatDate(parsedValue) === value) {
                            this.invalidText = null;
                            this.errorMessages = [];
                            this.onInput(value);
                        } else {
                            this.invalidText = value;
                        }
                    }
                }
            },
        },

        watch: {
            value() {
                this.invalidText = null;
            },
        },

        methods: {
            onInput(value) {
                this.$emit('input', value);
            },

            onBlur() {
                this.errorMessages = this.invalidText !== null ? ['Invalid date'] : [];
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
