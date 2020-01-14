import Vue from 'vue';
import DaySpanVuetify from 'dayspan-vuetify-2';
import router from './router';
import App from './App.vue';

import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2'
  }
});

new Vue({
  el: '#app',
  router,
  vuetify,
  render: h => h(App)
});
