import Vue from 'vue';
import DaySpanVuetify from 'dayspan-vuetify-2';
import router from './router';
import App from './App.vue';
import VuetifyDialog from 'vuetify-dialog';
import vuetify from './plugins/vuetify';
import "vuetify-dialog/dist/vuetify-dialog.min.css";

// const Vuetify = new vuetify({
//   theme: {dark: true}
// })
Vue.config.productionTip = false;

Vue.use(DaySpanVuetify, {
  data: {
    eventHeight: 20
  },
  methods: {
    getDefaultEventColor: () => '#1976d2'
  }
});

Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
});

new Vue({
  el: '#app',
  router,
  vuetify,
  render: h => h(App)
});
