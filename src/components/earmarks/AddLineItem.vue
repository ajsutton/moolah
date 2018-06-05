<template>
    <v-dialog max-width="400px" persistent v-model="visible">
        <v-btn slot="activator" small fab color="primary"><v-icon>add</v-icon></v-btn>

        <v-card>
            <v-card-title>
                Add Budget Line Item
            </v-card-title>
            <v-card-text>
                <category-selector v-model="category" :exclude="excludeCategories" required></category-selector>
                <v-text-field class="input" name="amount" v-model="amount" label="Budget" prefix="$" required :rules="rules.amount"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" flat @click.stop="close">Close</v-btn>
                <v-btn color="primary" flat @click.stop="add" :disabled="!valid">Add</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import CategorySelector from '../categories/CategorySelector.vue';
    import {rules, isValid} from '../validation.js';
    import client from '../../api/client';

    export default {
        props: {
            earmark: {
                type: Object,
                required: true
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
                rules
            };
        },
        computed: {
            valid() {
                return this.category !== undefined && isValid(this.amount, this.rules.amount);
            },
        },
        methods: {
            async add() {
                if (this.valid) {
                    try {
                        const parsedAmount = parseFloat(this.amount) * 100;
                        await client.setEarmarkBudget(this.earmark.id, this.category, parsedAmount);
                        this.close();
                        this.$emit('add', this.category, parsedAmount);
                    } catch (error) {
                        console.error(error);
                    }
                }
            },
            close() {
                this.visible = false;
            }
        },
        components: {
            CategorySelector
        }
    };
</script>