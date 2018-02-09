import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '../components/NotFound.vue';
import Analysis from '../components/analysis/Analysis.vue';
import Transactions from '../components/transactions/Transactions.vue';
import Account from '../components/accounts/Account.vue';
import UpcomingTransactions from '../components/transactions/UpcomingTransactions.vue';
import Categories from '../components/categories/Categories.vue';
import store, {mutations} from '../store/store';

Vue.use(Router);

function createTransactionProps(route) {
    return {
        accountId: route.params.accountId,
        searchOptions: {
            from: route.query.from,
            to: route.query.to,
            category: route.query.category,
            account: route.params.accountId,
            scheduled: false,
            page: parseInt(route.query.page) || 1
        },
    };
}

const router = new Router({
    mode: 'history',
    routes: [
        {path: '/', name: 'analysis', component: Analysis},
        {
            name: 'account',
            path: '/account/:accountId/',
            component: Account,
            props: createTransactionProps,
        },
        {path: '/transactions/', component: Transactions, props: createTransactionProps},
        {path: '/upcoming/', component: UpcomingTransactions},
        {path: '/categories/', component: Categories},
        {path: '*', component: NotFound},
    ],
    scrollBehavior(to, from, savedPosition) {
        return savedPosition ? savedPosition : {x: 0, y: 0};
    },
});
router.beforeEach((to, from, next) => {
    if (store.state.selectedTransactionId) {
        store.commit(mutations.selectTransaction, null);
    }
    next();
});
export default router;
