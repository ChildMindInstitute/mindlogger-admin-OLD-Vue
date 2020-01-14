import Vue from 'vue';
import Router from 'vue-router';
import Stepper from '@/Components/Stepper.vue';
import Builder from '@/Components/Builder/Builder.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/build',
      name: 'Builder',
      component: Builder,
    },
    {
      path: '/',
      name: 'Stepper',
      component: Stepper,
    },
  ]
})