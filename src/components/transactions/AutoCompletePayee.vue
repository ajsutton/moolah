<template>
    <div class="auto-complete-payee">
        <v-menu v-model="showMenu" offset-y>
            <v-text-field slot="activator" :name="name" :label="label" v-model="content" :rules="rules" @blur="$emit('blur')" ref="field"></v-text-field>
            <v-list>
                <v-list-tile v-for="item in items" :key="item.payee" @click="select(item)">
                    <v-list-tile-title>{{ item.payee }}</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';

    export default {
        props: ['value', 'rules', 'name', 'label'],
        data() {
            return {
                content: this.value,
                showMenu: false,
            };
        },

        computed: {
            ...mapState('transactions', ['transactions']),
            ...mapGetters({
                selectedTransaction: 'selectedTransaction',
            }),

            items() {
                const payees = new Set();
                const items = [];
                this.transactions.forEach(transaction => {
                    if (items.length < 5 &&
                        transaction.payee &&
                        !payees.has(transaction.payee) &&
                        transaction.payee.toLowerCase().includes(this.content.toLowerCase()) &&
                        transaction.id !== this.selectedTransaction.id) {
                        payees.add(transaction.payee);
                        items.push(transaction);
                    }
                });
                return items;
            },
        },

        watch: {
            content(value) {
                this.showMenu = true;
                this.$emit('input', value);
            },
        },

        methods: {
            focus() {
                this.$refs.field.focus();
            },

            select(transaction) {
                this.content = transaction.payee;
                this.$emit('autofill', transaction);
            },
        },
    };
</script>

<style lang="scss">
    .auto-complete-payee {
        .menu {
            display: block !important;
        }
    }
</style>