<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template #activator="{ props }">
            <v-btn
                icon
                :variant="iconVariant"
                :density="iconDensity"
                v-bind="props"
            >
                <v-icon title="Set Investment Value" :icon="icon"></v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-form
                ref="form"
                v-model="valid"
                lazy-validation
                @submit.prevent="submit()"
            >
                <v-card-title>Set Investment Value</v-card-title>
                <template v-if="errorMessage != null">
                    <v-alert type="error">{{ errorMessage }}</v-alert>
                </template>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col sm="6" cols="12">
                                <date-picker-field
                                    v-model="date"
                                    label="Date"
                                ></date-picker-field>
                            </v-col>
                            <v-col sm="6" cols="12">
                                <v-text-field
                                    ref="value"
                                    v-model="displayValue"
                                    autofocus
                                    name="value"
                                    label="Value"
                                    prefix="$"
                                    :rules="rules.amount"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="text-primary"
                        variant="text"
                        @click="dialog = false"
                        >Close</v-btn
                    >
                    <v-btn
                        type="submit"
                        class="text-primary"
                        variant="text"
                        @click="submit"
                        >Set</v-btn
                    >
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>
<script setup>
import IconAdd from '~icons/mdi/add';
import IconEdit from '~icons/mdi/edit';
</script>

<script>
import { mapActions } from 'pinia';
import { rules } from '../validation';
import DatePickerField from '../util/DatePickerField.vue';
import { formatDate } from '../../api/apiFormats';
import parseMoney from '../util/parseMoney';
import formatMoney from '../util/formatMoney';
import { useValuesStore, actions } from '../../stores/valuesStore';

export default {
    props: ['input', 'iconDensity', 'iconVariant'],
    data() {
        return {
            origDate: null,
            date: formatDate(new Date()),
            dialog: false,
            errorMessage: null,
            value: 0,
            rawValue: '0.00',

            valid: true,

            rules: {
                amount: rules.amount,
            },
        };
    },
    computed: {
        icon() {
            return this.editing ? IconEdit : IconAdd;
        },
        editing() {
            return !!this.origDate;
        },
        displayValue: {
            set(newValue) {
                this.rawValue = newValue;
                this.value = parseMoney(newValue);
            },
            get() {
                return this.rawValue;
            },
        },
    },

    watch: {
        input(newValue) {
            this.syncFromValue(newValue);
        },
    },

    created() {
        this.syncFromValue(this.input);
    },

    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    const value = { date: this.date, value: this.value };
                    if (this.origDate !== null && this.origDate !== this.date) {
                        await this[actions.deleteValue](value);
                    }
                    await this[actions.setValue](value);
                    this.dialog = false;
                    this.syncFromValue(this.input);
                } catch (error) {
                    this.dialog = true;
                    this.errorMessage = error.message || error;
                }
            }
        },
        syncFromValue(value) {
            if (value) {
                this.origDate = value.date;
                this.date = value.date;
                this.value = value.value;
                this.rawValue = formatMoney(value.value, false, true);
            } else {
                this.origDate = null;
                this.date = formatDate(new Date());
                this.value = 0;
                this.rawValue = '';
            }
            this.errorMessage = null;
        },
        ...mapActions(useValuesStore, [actions.setValue, actions.deleteValue]),
    },
    components: {
        DatePickerField,
    },
};
</script>
