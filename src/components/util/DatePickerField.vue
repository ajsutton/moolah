<template>
    <v-menu
        v-model="showMenu"
        transition="scale-transition"
        :close-on-content-click="false"
    >
        <template v-slot:activator="{ props }">
            <v-text-field
                ref="textField"
                :label="label"
                :rules="allRules"
                :clearable="optional"
                validate-on="blur"
                v-model="textValue"
                v-bind="removeKeydown(props)"
                @blur="onBlur"
                @keyup.up.prevent="incrementDate"
                @keyup.down.prevent="decrementDate"
            ></v-text-field>
        </template>
        <v-date-picker
            :value="parsedDate"
            @update:modelValue="onInput"
            hide-header
            show-adjacent-months
        >
        </v-date-picker>
    </v-menu>
</template>

<script>
import { addDays } from 'date-fns';
import { formatDate, parseDate } from '../../api/apiFormats';

export default {
    props: {
        modelValue: String,
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
    emits: ['update:modelValue'],
    data() {
        return {
            showMenu: false,
            invalidText: null,
        };
    },
    computed: {
        parsedDate() {
            return parseDate(this.modelValue);
        },
        textValue: {
            get() {
                return this.invalidText !== null
                    ? this.invalidText
                    : this.modelValue;
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
            this.$emit('update:modelValue', formatDate(value));
            if (this.$refs.textField) {
                this.$refs.textField.validate();
            }
            this.showMenu = false;
        },

        onBlur() {
            if (this.$refs.textField) {
                this.$refs.textField.validate();
            }
        },

        incrementDate() {
            this.onInput(addDays(parseDate(this.modelValue), 1));
        },

        decrementDate() {
            this.onInput(addDays(parseDate(this.modelValue), -1));
        },
        removeKeydown(props) {
            delete props.onKeydown;
            return props;
        },
    },
};
</script>
