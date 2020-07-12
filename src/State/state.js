import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import { Store } from "vuex";
import _ from "lodash";
import createPersistedState from "vuex-persistedstate";
import api from "../Components/Utils/api/api.vue";

const getDefaultState = () => {
  console.log(process.env);
  return {
    backend: process.env.VUE_APP_SERVER_URL,
    currentAccount: {},
    currentApplets: [],
    ownerAccount: {},
    allApplets: [],
    allAccounts: [],
    cachedEvents: [],
    currentApplet: {},
    removedEvents: [],
    updatedEvents: [],
    auth: {},
    continue: {},
    currentUsers: [],
    userEmail: "",
    users: {},
  };
};

const state = getDefaultState();

const mutations = {
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  addRemovedEventId(state, eventId) {
    state.removedEvents.push(eventId);
  },
  addUpdatedEventId(state, eventId) {
    state.updatedEvents.push(eventId);
  },
  resetUpdatedEventId(state) {
    state.removedEvents = [];
    state.updatedEvents = [];
  },
  setBackend(state, backend) {
    const backendServers = [
      { url: "https://api-prod.mindlogger.org/api/v1", env: "production" },
      { url: "https://api-staging.mindlogger.org/api/v1", env: "development" },
      { url: "https://api-test.mindlogger.org/api/v1", env: "staging" },
      { url: "http://localhost:8080/api/v1", env: "local" },
      { url: process.env.CUSTOM_URL || "", env: "other" },
    ];
    state.backend =
      backend ||
      _.find(backendServers, { env: process.env.NODE_ENV }).url ||
      backendServers[0].url;
  },
  setAccounts(state, accounts) {
    state.allAccounts = accounts;
  },
  switchAccount(state, account) {
    const accounts = [];
    state.currentAccount = account;

    Object.keys(account.applets).forEach((key, index) => {
      if (account.applets[key] && account.applets[key].length) {
        account.applets[key].forEach((appletId, index) => {
          if (!accounts.includes(appletId, 0)) {
            accounts.push(appletId);
          }
        });
      }
    });
    state.currentApplets = accounts;
  },
  setCurrentApplet(state, protocol) {
    if (protocol) {
      state.currentApplet = protocol;
    }
  },
  setAllApplets(state, protocols) { 
    state.allApplets = protocols;
  },

  updateAllApplets(state) {
    const currentApplets = state.currentAccount.applets;
    const protocols = state.allApplets;
    const requests = [];

    protocols.forEach((protocol, i) => {
      const appletId = protocol.applet._id.split("applet/")[1];
      let roleValue = 0;

      Object.keys(currentApplets).forEach((key, index) => {
        if (currentApplets[key] && currentApplets[key].length) {
          currentApplets[key].forEach((id, index) => {
            if (
              appletId === id &&
              key !== "user"
            ) {
              state.allApplets[i].role = key;
              roleValue ++;
            }
          });
        }
      });
      if (roleValue === 4) {
        state.allApplets[i].role = "manager";
      } else if (roleValue === 5) {
        state.allApplets[i].role = "owner";
      }

      if (
        state.allApplets[i].role === "owner" ||
        state.allApplets[i].role === "manager" ||
        state.allApplets[i].role === "coordinator"
      ) {
        requests.push(
          api
            .getSchedule({
              apiHost: state.backend,
              token: state.auth.authToken.token,
              id: appletId,
            })
            .then((res) => {
              state.allApplets[i].applet.schedule = res.data;
            })
            .catch((err) => {
              console.log("error", err);
            })
        );
      }
    });
    Promise.all(requests).then();
  },

  setApplet(state, applet) {
    if (applet) {
      state.currentApplet.applet = applet;
    }
  },
  setAuth(state, userData) {
    state.auth = userData.auth;
    if (userData.auth.account) {
      state.currentAccount = userData.auth.account;
      state.currentApplets = userData.auth.account.applets.owner;
      state.ownerAccount = userData.auth.account;
    }
    state.userEmail = userData.email;
  },

  setCachedEvents(state, events) {
    if (events) {
      state.cachedEvents = events;
    }
  },
  setSchedule(state, schedule) {
    if (!_.isEmpty(state.currentApplet)) {
      // TODO: this sucks.
      const idx = _.findIndex(
        state.allApplets,
        (a) => a.applet._id == state.currentApplet.applet._id
      );
      if (idx > -1) {
        state.allApplets[idx].applet.schedule = schedule;
        state.currentApplet = state.allApplets[idx];
      }
      // update this in the copy too.
      //state.currentApplet = {...state.currentApplet, schedule };
    }
  },
  setGroups(state, groups) {
    // TODO: this sucks.
    const idx = _.findIndex(
      state.allApplets,
      (a) =>
        a.applet["skos:prefLabel"] ==
        state.currentApplet.applet["skos:prefLabel"]
    );
    if (idx > -1) {
      state.allApplets[idx].groups = groups;
    }
    // update this in the copy too.
    state.currentApplet = { ...state.currentApplet, groups };
  },
  setCurrentUsers(state, users) {
    state.currentUsers = users;
  },
  setUsers(state, newUsers) {
    state.users = newUsers;
  },
  setReviewers(state, reviewers) {
    state.reviewers = reviewers;
  },
  setAccountName(state, accountName) {
    state.ownerAccount.accountName = accountName;
  },
  continue(state, params) {
    state.continue[params.component] = params.continue;
  },
};

export const storeConfig = {
  state,
  mutations,
  plugins: [createPersistedState({ storage: window.sessionStorage })],
};

const store = new Store(storeConfig);

export default store;
