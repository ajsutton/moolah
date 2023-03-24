import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '../components/NotFound.vue';
import Analysis from '../components/analysis/Analysis.vue';
import AllTransactions from '../components/transactions/AllTransactions.vue';
import Account from '../components/accounts/Account.vue';
import Earmark from '../components/earmarks/Earmark.vue';
import UpcomingTransactions from '../components/transactions/UpcomingTransactions.vue';
import Categories from '../components/categories/Categories.vue';
import Reports from '../components/reports/Reports.vue';
import store, { mutations } from '../store/store';

Vue.use(Router);

function createTransactionProps(route) {
    return {
        accountId: route.params.accountId,
        earmarkId: route.params.earmarkId,
        searchOptions: {
            from: route.query.from,
            to: route.query.to,
            category: route.query.category,
            account: route.params.accountId,
            earmark: route.params.earmarkId,
            scheduled: false,
            page: parseInt(route.query.page) || 1,
        },
    };
}

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/', name: 'analysis', component: Analysis },
        {
            name: 'account',
            path: '/account/:accountId/',
            component: Account,
            props: createTransactionProps,
        },
        {
            name: 'earmark',
            path: '/earmark/:earmarkId/',
            component: Earmark,
            props: createTransactionProps,
        },
        {
            path: '/transactions/',
            component: AllTransactions,
            props: createTransactionProps,
        },
        { path: '/upcoming/', component: UpcomingTransactions },
        { path: '/categories/', component: Categories },
        { path: '/reports/', component: Reports },
        { path: '*', component: NotFound },
    ],
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { x: 0, y: 0 };
    },
});
router.beforeEach((to, from, next) => {
    if (store.state.selectedTransactionId) {
        store.commit(mutations.selectTransaction, null);
    }
    next();
});
export default router;
