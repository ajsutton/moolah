import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '../components/NotFound.vue';
import Analysis from '../components/analysis/Analysis.vue';
import Transactions from '../components/transactions/Transactions.vue';
import UpcomingTransactions from '../components/transactions/UpcomingTransactions.vue';
import Categories from '../components/categories/Categories.vue';
import store from '../store/store';
import {mutations} from '../store/store';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        {path: '/', name: 'analysis', component: Analysis},
        {path: '/account/:accountId/', component: Transactions, props: true},
        {path: '/transactions/', component: Transactions, props: true},
        {path: '/upcoming/', component: UpcomingTransactions },
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
