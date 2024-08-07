<template>
    <v-dialog v-model="visible" max-width="400px">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn size="small" icon color="primary" v-bind="activatorProps"
                ><v-icon :icon="IconAdd"></v-icon
            ></v-btn>
        </template>

        <v-card>
            <v-card-title> Add Budget Line Item </v-card-title>
            <v-card-text>
                <category-selector
                    v-model="category"
                    :exclude="excludeCategories"
                    required
                ></category-selector>
                <v-text-field
                    v-model="amount"
                    class="input"
                    name="amount"
                    label="Budget"
                    prefix="$"
                    required
                    :rules="rules.amount"
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click.stop="close">Close</v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    :disabled="!valid"
                    @click.stop="add"
                    >Add</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import IconAdd from '~icons/mdi/add';
</script>

<script>
import CategorySelector from '../categories/CategorySelector.vue';
import { rules, isValid } from '../validation.js';
import client from '../../api/client';
import parseMoney from '../util/parseMoney';

export default {
    components: {
        CategorySelector,
    },
    props: {
        earmark: {
            type: Object,
            required: true,
        },
        excludeCategories: {
            type: Array,
        },
    },
    data() {
        return {
            visible: false,
            category: null,
            amount: null,
            rules,
        };
    },
    computed: {
        valid() {
            return (
                this.category !== undefined &&
                isValid(this.amount, this.rules.amount)
            );
        },
    },
    methods: {
        async add() {
            if (this.valid) {
                try {
                    const parsedAmount = parseMoney(this.amount);
                    await client.setEarmarkBudget(
                        this.earmark.id,
                        this.category,
                        parsedAmount
                    );
                    this.close();
                    this.$emit('add', this.category, parsedAmount);
                } catch (error) {
                    console.error(error);
                }
            }
        },
        close() {
            this.visible = false;
        },
    },
};
</script>
