<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
                <v-icon title="Set Investment Value">{{ icon }}</v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-form v-model="valid" ref="form" lazy-validation>
                <v-card-title>Set Investment Value</v-card-title>
                <template v-if="errorMessage != null">
                    <v-alert error :value="true">{{ errorMessage }}</v-alert>
                </template>
                <v-card-text>
                    <v-container>
                        <v-layout row wrap>
                            <v-flex sm6 xs12>
                                <date-picker-field
                                    label="Date"
                                    v-model="date"
                                ></date-picker-field>
                            </v-flex>
                            <v-flex sm6 xs12>
                                <v-text-field
                                    name="value"
                                    label="Value"
                                    v-model="displayValue"
                                    prefix="$"
                                    :rules="rules.value"
                                    ref="value"
                                ></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="blue--text darken-1"
                        text
                        @click.native="dialog = false"
                        >Close</v-btn
                    >
                    <v-btn
                        class="blue--text darken-1"
                        text
                        @click.native="submit"
                        >Set</v-btn
                    >
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import { actions } from '../../store/wallets/valuesStore';
import { rules } from '../validation';
import { VForm, VCheckbox } from 'vuetify';
import DatePickerField from '../util/DatePickerField.vue';
import { formatDate } from '../../api/apiFormats';

export default {
    props: ['input'],
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
            return this.editing ? 'edit' : 'add';
        },
        editing() {
            return !!this.origDate;
        },
        displayValue: {
            set(newValue) {
                this.rawValue = newValue;
                this.value = Math.round(newValue * 100);
            },
            get() {
                return this.rawValue;
            },
        },
    },

    created() {
        this.syncFromValue(this.input);
    },

    watch: {
        input(newValue) {
            this.syncFromValue(newValue);
        },
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
                    console.log('Sync', this.input);
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
                this.rawValue = (value.value / 100).toFixed(2);
            } else {
                this.origDate = null;
                this.date = formatDate(new Date());
                this.value = 0;
                this.rawValue = '0.00';
            }
            this.errorMessage = null;
        },
        ...mapActions('values', [actions.setValue, actions.deleteValue]),
    },
    components: {
        VForm,
        DatePickerField,
        VCheckbox,
    },
};
</script>
