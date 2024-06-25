// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './vuetify';
import { PiniaVuePlugin, createPinia, setActivePinia } from 'pinia';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
setActivePinia(pinia);

new Vue({
    vuetify,
    el: '#app',
    router,
    components: { App },
    render: h => h(App),
    pinia,
});
