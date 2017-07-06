import Vuex from 'vuex';
import Vue from 'vue';
import accountsModule from './accountsStore';
import transactionsModule from './transactionStore';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        accounts: accountsModule,
        transactions: transactionsModule,
    },
});
