// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './vuetify';

new Vue({
    vuetify,
    el: '#app',
    router,
    render: h => h(App),
    components: { App },
});
