<template>
    <table class="table spending-breakdown">
        <thead>
        <tr>
            <th class="text-xs-left">Category</th>
            <th class="text-xs-right">Spent</th>
            <th class="text-xs-right">Total</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="category in flattenedCategories" :key="category.id">
            <td>
                <div :style="{'margin-left': category.level * 24 + 'px'}">{{category.name}}</div>
            </td>
            <td class="text-xs-right">
                <monetary-amount :value="category.balance" v-if="category.balance !== 0"></monetary-amount>
            </td>
            <td class="text-xs-right">
                <monetary-amount :value="category.subtotal" v-if="category.total"></monetary-amount>
            </td>
        </tr>
        </tbody>
        <tfoot>
        <tr>
            <th class="text-xs-left">Total</th>
            <th></th>
            <th class="text-xs-right">
                <monetary-amount :value="earmark.spent"></monetary-amount>
            </th>
        </tr>
        </tfoot>
    </table>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import client from '../../api/client';
    import {buildCategoryBalanceTree} from './categoryBalances';

    export default {
        props: {
            earmark: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                categoryBalanceById: {},
            };
        },
        computed: {
            categories() {
                return buildCategoryBalanceTree(this.categoryBalanceById, this.rawCategories);
            },
            flattenedCategories() {
                const result = [];
                const addCategory = (category, level, namePrefix) => {
                    const parentRequired = category.balance !== 0 || category.children.length > 1;
                    category.level = level;
                    category.name = namePrefix + category.name;
                    if (parentRequired) {
                        result.push(category);
                    }
                    category.children.forEach(child => addCategory(child, parentRequired ? level + 1 : level, parentRequired ? '' : category.name + ' - '));
                    if (category.children.length > 1) {
                        result.push({name: 'Total ' + category.name, subtotal: category.subtotal, balance: 0, level: level, total: true});
                    }
                };
                this.categories.forEach(category => addCategory(category, 0, ''));
                return result;
            },

            ...mapState('categories', {rawCategories: 'categories'}),
            ...mapGetters('categories', ['getCategoryName']),
        },
        created() {
            this.load();
        },
        methods: {
            async load() {
                this.categoryBalanceById = await client.categoryBalances({earmark: this.earmark.id});
            },
        },
        components: {
            MonetaryAmount,
        },
    };
</script>

<style lang="scss">
    .spending-breakdown {
        tfoot td, tfoot th {
            padding: 0 24px;
            color: rgba(0, 0, 0, .54);
            font-weight: 500;
            font-size: 12px;
        }

        tfoot {
            border-top: rgba(0,0,0,.12) solid 3px;
        }
    }
</style>
