import Vue from 'vue';
import Router from 'vue-router';
import NotFound from '@/components/NotFound';
import NetWorth from '@/components/networth/NetWorth';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {path: '/', name: 'networth', component: NetWorth},
    {path: '*', component: NotFound},
  ],
});
