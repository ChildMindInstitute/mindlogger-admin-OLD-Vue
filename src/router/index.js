import Vue from "vue";
import Router from "vue-router";
import Builder from "@/Components/Builder/Builder.vue";
import Login from "../Steps/Login";
import SetApplet from "../Steps/SetApplet";
import SetUsers from "../Steps/SetUsers";
import SetSchedule from "../Steps/SetSchedule";
import TokenLoggerDashboard from "../Steps/TokenLoggerDashboard";

import _ from "lodash";

import store from "../State/state";

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: "/build",
      name: "Builder",
      component: Builder,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        guest: true,
      },
    },
    {
      path: "/applets",
      name: "SetApplet",
      component: SetApplet,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/applet/:appletId/users",
      name: "SetUsers",
      component: SetUsers,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/applet/:appletId/schedule",
      name: "SetSchedule",
      component: SetSchedule,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/applet/:appletId/dashboard",
      name: "TokenLoggerDashboard",
      component: TokenLoggerDashboard,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/",
      redirect: "/login",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !_.isEmpty(store.state.auth);
  const isPrivatePage = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestPage = to.matched.some((record) => record.meta.guest);
  const lang = (from.query.lang || store.state.currentLanguage || 'en');

  // Redirect unauthenticated users to the login page if they are trying to
  // access a page that requires authentication.
  if (isPrivatePage && !isLoggedIn) {
    return next({
      path: "/login",
      query: { nextUrl: to.fullPath, lang },
    });
  } 

  // Prevent users from accessing the login page if they are already
  // authenticated.
  if (isGuestPage && isLoggedIn) {
    return next({ path: "/applets", query: { lang }});
  } 

  // When navigating to a page, make sure that the current language is persisted
  // in the URL.
  if (to && !to.query.lang) {
    return next({
      path: to.path, 
      query: { ...to.query, lang },
      params: to.params,
    });
  }

  next();
});

export default router;
