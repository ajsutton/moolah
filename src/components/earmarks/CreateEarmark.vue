<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template #activator="{ props }">
            <v-btn icon v-bind="props">
                <v-icon :title="title" :icon="icon"></v-icon>
            </v-btn>
        </template>
        <v-card>
            <v-form ref="form" v-model="valid" lazy-validation>
                <v-card-title>{{ title }}</v-card-title>
                <template v-if="errorMessage != null">
                    <v-alert error :value="true">{{ errorMessage }}</v-alert>
                </template>
                <v-card-text>
                    <v-container>
                        <v-text-field
                            v-model="name"
                            label="Name"
                            name="name"
                            :rules="rules.name"
                            required
                            autofocus
                        ></v-text-field>

                        <div class="subheading mt-4">Savings goal</div>

                        <v-row>
                            <v-col sm="4" cols="12">
                                <v-text-field
                                    v-model="savingsTarget"
                                    label="Savings target"
                                    prefix="$"
                                    type="text"
                                    name="savingsTarget"
                                    :rules="rules.savingsTarget"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col sm="3" offset-sm="1" cols="12">
                                <date-picker-field
                                    v-model="savingsStartDate"
                                    label="Start"
                                    :optional="true"
                                ></date-picker-field>
                            </v-col>
                            <v-col sm="3" offset-sm="1" cols="12">
                                <date-picker-field
                                    v-model="savingsEndDate"
                                    label="End"
                                    :optional="true"
                                    :rules="rules.endDate"
                                ></date-picker-field>
                            </v-col>
                        </v-row>

                        <v-checkbox
                            v-if="canHide"
                            v-model="hidden"
                            label="Closed"
                        ></v-checkbox>
                        <small>*indicates required field</small>
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
                        class="text-primary"
                        variant="text"
                        @click="submit"
                        >{{ action }}</v-btn
                    >
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script setup>
import IconAdd from '~icons/mdi/add'
import IconEdit from '~icons/mdi/edit'
</script>

<script>
import { mapActions } from 'pinia';
import { useEarmarksStore, actions } from '../../stores/earmarksStore';
import { rules } from '../validation';
import DatePickerField from '../util/DatePickerField.vue';
import isBefore from 'date-fns/isBefore';
import formatMoney from '../util/formatMoney';
import parseMoney from '../util/parseMoney';
import { parseDate } from '../../api/apiFormats';

export default {
    props: ['earmark'],
    data() {
        return {
            name: 'Unnamed earmark',
            savingsTarget: null,
            savingsStartDate: null,
            savingsEndDate: null,
            dialog: false,
            errorMessage: null,
            hidden: false,

            valid: true,

            rules: {
                name: rules.walletName,
                endDate: [
                    value => {
                        if (
                            this.savingsStartDate &&
                            isBefore(
                                parseDate(this.savingsEndDate),
                                parseDate(this.savingsStartDate)
                            )
                        ) {
                            return 'Must be after start date';
                        }
                        return true;
                    },
                ],
            },
        };
    },
    computed: {
        title() {
            return this.editing ? 'Edit Earmark' : 'Create Earmark';
        },
        icon() {
            return this.editing ? IconEdit : IconAdd;
        },
        action() {
            return this.editing ? 'Save' : 'Create';
        },
        editing() {
            return !!this.earmark;
        },
        canHide() {
            return this.editing && (this.earmark.balance === 0 || this.hidden);
        },
    },

    watch: {
        earmark(newEarmark) {
            this.syncFromEarmark(newEarmark);
        },
    },

    created() {
        this.syncFromEarmark(this.earmark);
    },

    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    if (this.editing) {
                        await this[actions.updateEarmark]({
                            id: this.earmark.id,
                            patch: {
                                name: this.name,
                                type: this.type,
                                hidden: this.hidden,
                                savingsTarget: parseMoney(this.savingsTarget),
                                savingsStartDate:
                                    this.savingsStartDate || undefined,
                                savingsEndDate:
                                    this.savingsEndDate || undefined,
                            },
                        });
                    } else {
                        await this[actions.createEarmark]({
                            name: this.name,
                            type: this.type,
                            savingsTarget: parseMoney(this.savingsTarget),
                            savingsStartDate:
                                this.savingsStartDate || undefined,
                            savingsEndDate: this.savingsEndDate || undefined,
                        });
                        this.syncFromEarmark(undefined);
                    }
                    this.dialog = false;
                } catch (error) {
                    this.dialog = true;
                    this.errorMessage = error.message || error;
                }
            }
        },
        syncFromEarmark(newEarmark) {
            if (newEarmark) {
                this.name = newEarmark.name;
                this.savingsTarget = formatMoney(
                    newEarmark.savingsTarget,
                    false,
                    true
                );
                this.savingsStartDate = newEarmark.savingsStartDate;
                this.savingsEndDate = newEarmark.savingsEndDate;
                this.hidden = newEarmark.hidden;
            } else {
                this.name = 'Unnamed earmark';
                this.savingsTarget = null;
                this.savingsStartDate = null;
                this.savingsEndDate = null;
                this.hidden = false;
            }
            this.errorMessage = null;
        },
        ...mapActions(useEarmarksStore, [
            actions.createEarmark,
            actions.updateEarmark,
        ]),
    },
    components: {
        DatePickerField,
    },
};
</script>
