import Vue from 'vue';
import Router from 'vue-router';
import Stepper from '@/Components/Stepper.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Stepper',
      component: Stepper
    }
  ]
})