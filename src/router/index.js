import Vue from 'vue';
import Router from 'vue-router';
import Stepper from '@/Components/Stepper.vue';
import Builder from '@/Components/Builder/Builder.vue';
import Login from '../Steps/Login';
import SetApplet from '../Steps/SetApplet';
import SetUsers from '../Steps/SetUsers';
import SetSchedule from '../Steps/SetSchedule';

import _ from 'lodash';

import store from '../State/state';


Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: '/build',
      name: 'Builder',
      component: Builder,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
          guest: true
      }
    },
    {
      path: '/applets',
      name: 'SetApplet',
      component: SetApplet,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/users',
      name: 'SetUsers',
      component: SetUsers,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/schedules',
      name: 'SetSchedule',
      component: SetSchedule,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/',
      redirect: '/login',
    },
  ]
});


router.beforeEach((to, from, next) => {
  console.log('store:', store.state);
  const isNotLoggedIn = _.isEmpty(store.state.auth);
  if (to.matched.some(record => record.meta.requiresAuth)) {
      if (isNotLoggedIn) {
          next({
              path: '/login',
              params: { nextUrl: to.fullPath },
          });
      } else {
          next();
      }
  } else if (to.matched.some(record => record.meta.guest)) {
      if (isNotLoggedIn) {
          next();
      }
      else {
          next({
            path: '/applets',
          });
      }
  } else {
      next();
  }
})

export default router