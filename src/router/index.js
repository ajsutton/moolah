import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '../components/NotFound.vue';
import NetWorth from '../components/networth/NetWorth.vue';
import Transactions from '../components/transactions/Transactions.vue';
import Categories from '../components/categories/Categories.vue';
import store from '../store/store';
import {mutations} from '../store/store';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        {path: '/', name: 'networth', component: NetWorth},
        {path: '/account/:accountId/', component: Transactions, props: true},
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
