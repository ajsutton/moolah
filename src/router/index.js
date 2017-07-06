import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '../components/NotFound.vue';
import NetWorth from '../components/networth/NetWorth.vue';
import Transactions from '../components/transactions/Transactions.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {path: '/', name: 'networth', component: NetWorth},
        {path: '/account/:accountId/', component: Transactions, props: true},
        {path: '*', component: NotFound},
    ],
});
