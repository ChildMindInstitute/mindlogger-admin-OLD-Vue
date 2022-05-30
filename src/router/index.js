import Vue from "vue";
import Router from "vue-router";
import Builder from "@/Components/Builder/Builder.vue";
import Login from "../Steps/Login";
import Dashboard from "../Steps/Dashboard";
import Library from "../Steps/Library";
import SetUsers from "../Steps/SetUsers";
import CaseDashboard from "../Steps/CaseDashboard";
import SetSchedule from "../Steps/SetSchedule";
import ReviewerDashboard from "../Steps/ReviewerDashboard";
import { getLanguageCode } from '../plugins/language';

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
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
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
      path: "/case/:caseId/dashboard",
      name: "CaseDashboard",
      component: CaseDashboard,
      meta: {
        requiresAuth: true,
      }
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
      name: "ReviewerDashboard",
      component: ReviewerDashboard,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/library",
      name: "Library",
      component: Library,
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
  const lang = getLanguageCode(
    from.query.lang || store.state.currentLanguage || 'en'
  );

  // Redirect unauthenticated users to the login page if they are trying to
  // access a page that requires authentication.
  if ( (isPrivatePage || !to.matched.length) && !isLoggedIn) {
    return next({
      path: "/login",
      query: { nextUrl: to.fullPath, lang },
    });
  }

  // Prevent users from accessing the login page if they are already
  // authenticated.
  if ( (isGuestPage || !to.matched.length) && isLoggedIn) {
    return next({ path: "/dashboard", query: { lang }});
  }

  // Evaluates to true if the lang parameter is set to just 'en' instead of
  // 'en_US'.
  const isShortLangCode =  to.query.lang && to.query.lang.length < 5;

  // When navigating to a page, make sure that the current language is persisted
  // in the URL.
  if (to && !to.query.lang || isShortLangCode) {
    return next({
      ...to,
      path: to.path,
      query: { ...to.query, lang },
      params: to.params,
    });
  }
  return next();
});

export default router;
