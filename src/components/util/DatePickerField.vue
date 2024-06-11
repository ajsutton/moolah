<template>
    <v-menu
        :close-on-content-click="true"
        v-model="dateMenu"
        offset-y
        :nudge-right="40"
        max-width="290px"
        transition="scale-transition"
    >
        <template v-slot:activator="{ on }">
            <v-text-field
                v-on="on"
                :label="label"
                v-model="textValue"
                :rules="allRules"
                :clearable="optional"
                validate-on-blur
                @blur="onBlur"
                ref="textField"
                v-on:keyup.up="incrementDate"
                v-on:keyup.down="decrementDate"
                :disabled="disabled"
            ></v-text-field>
        </template>
        <v-date-picker :value="value" @input="onInput" no-title scrollable>
        </v-date-picker>
    </v-menu>
</template>

<script>
import addDays from 'date-fns/addDays';
import { formatDate, parseDate } from '../../api/apiFormats';

export default {
    props: {
        value: String,
        optional: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: 'Date',
        },
        rules: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            invalidText: null,
            dateMenu: false,
        };
    },

    computed: {
        textValue: {
            get() {
                return this.invalidText !== null
                    ? this.invalidText
                    : this.value;
            },
            set(value) {
                if (
                    this.optional &&
                    (value === undefined || value === null || value === '')
                ) {
                    this.invalidText = null;
                    this.onInput(undefined);
                } else {
                    const parsedValue = parseDate(value);
                    if (
                        !isNaN(parsedValue) &&
                        formatDate(parsedValue) === value
                    ) {
                        this.invalidText = null;
                        this.onInput(value);
                    } else {
                        this.invalidText = value;
                    }
                }
            },
        },

        allRules() {
            return [
                () => (this.invalidText !== null ? 'Invalid date' : true),
                ...this.rules,
            ];
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
            if (this.$refs.textField) {
                this.$refs.textField.validate();
            }
        },

        onBlur() {
            if (this.$refs.textField) {
                this.$refs.textField.validate();
            }
        },

        incrementDate() {
            this.$emit('input', formatDate(addDays(parseDate(this.value), 1)));
            this.dateMenu = false;
        },

        decrementDate() {
            this.$emit('input', formatDate(addDays(parseDate(this.value), -1)));
            this.dateMenu = false;
        },
    },
};
</script>
