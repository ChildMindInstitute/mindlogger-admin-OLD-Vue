import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { Store } from 'vuex';
import _ from 'lodash';
import createPersistedState from 'vuex-persistedstate';

const getDefaultState = () => {
  return {
    backend: process.env.VUE_APP_SERVER_URL,
    currentAccount: {},
    currentApplets: [],
    ownerAccount: {},
    currentUser: {},
    allApplets: {},
    allAccounts: [],
    cachedEvents: [],
    currentAppletMeta: null,
    currentAppletData: null,
    currentAccountApplets: [],
    removedEvents: [],
    updatedEvents: [],
    auth: {},
    fullDirectory: [],
    continue: {},
    currentUsers: {},
    userEmail: '',
    users: {},
    pinned: {
    },
    currentLanguage: 'en_US',
    currentRetentions: null,
    fromLibrary: false,
    currentAppletBuilderData: null,
  };
};

const state = getDefaultState();

const mutations = {
  setCurrentLanguage(state, lang) {
    state.currentLanguage = lang;
  },
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  addRemovedEventId(state, eventId) {
    state.removedEvents.push(eventId);
  },
  addUpdatedEventId(state, eventId) {
    state.updatedEvents.push(eventId);
  },
  setViewAlert(state, alertId) {
    if (state.currentAccount && state.currentAccount.alerts) {
      const alertList = state.currentAccount.alerts.list;

      for (let alert of alertList) {
        if (alert.id == alertId) {
          alert.viewed = true;
        }
      }
    }
  },
  resetUpdatedEventId(state) {
    state.removedEvents = [];
    state.updatedEvents = [];
  },
  setBackend(state, backend) {
    // const backendServers = [
    //   { url: "https://api-prod.mindlogger.org/api/v1", env: "production" },
    //   { url: "https://api-staging.mindlogger.org/api/v1", env: "development" },
    //   { url: "https://api-test.mindlogger.org/api/v1", env: "staging" },
    //   { url: "http://localhost:8080/api/v1", env: "local" },
    //   { url: process.env.CUSTOM_URL || "", env: "other" },
    // ];

    // state.backend =
    //   backend ||
    //   _.find(backendServers, { env: process.env.NODE_ENV }).url ||
    //   backendServers[0].url;

    state.backend = backend || process.env.VUE_APP_SERVER_URL;
  },
  setAccounts(state, accounts) {
    state.allAccounts = accounts;
  },
  setUserDetails(state, user) {
    state.currentUser = user;
  },
  switchAccount(state, account) {
    state.currentAccount = account;
    /** handle deleted applets */
    Object.keys(state.allApplets).forEach(appletId => {
      if (state.allApplets[appletId].accountId === account.accountId) {
        if (!account.applets.some((applet) => applet.id === appletId)) {
          delete state.allApplets[appletId];
        }
      }
    })
  },
  setCurrentApplet(state, applet) {
    if (applet) {
      state.currentAppletMeta = applet;
      if (applet.id && state.allApplets[applet.id]) {
        state.currentAppletData = state.allApplets[applet.id];
      }
    } else {
      state.currentAppletMeta = null;
      state.currentAppletData = null;
    }
  },

  setAppletPrivateKey(state, { appletId, key }) {
    const applet = state.allApplets[appletId];

    if (applet && applet.applet.encryption) {
      applet.applet.encryption.appletPrivateKey = key;
    }
  },

  updateAppletData(state, applet) {
    const appletID = applet.applet._id.split('/')[1]

    state.allApplets[appletID] = applet;

    if (state.currentAppletMeta && appletID === state.currentAppletMeta.id) {
      state.currentAppletData = applet;
    }
  },

  setApplet(state, applet) {
    if (applet) {
      state.currentAppletMeta.applet = applet;
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
    if (state.currentAppletMeta && !_.isEmpty(state.currentAppletMeta)) {
      state.currentAppletData.applet.schedule = schedule;
    }
  },
  setGroups(state, groups) {
    state.currentAppletData.groups = groups;
  },
  setCurrentUsers(state, users) {
    state.currentUsers = users;
  },
  selectUser(state, user) {
    state.currentUsers[user['_id']] = user;
  },
  unSelectUser(state, user) {
    if (state.currentUsers[user['_id']]) {
      delete state.currentUsers[user['_id']];
    }
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
  setCurrentRetentionSettings(state, settings) {
    state.currentRetentions = settings;
  },
  setCurrentAccountApplets(state, applets) {
    if (applets && applets.length > 0) {
      state.currentAccount.applets = applets;
    }
  },
  setFullDirectory(state, fullDirectory) {
    state.fullDirectory = fullDirectory;
  },
  removeDeletedFolder(state, deletedFolder) {
    state.fullDirectory = state.fullDirectory.filter(item => item.id != deletedFolder.id);
  },
  removeDeletedApplet(state, applet) {
    state.currentAccount.applets = state.currentAccount.applets.filter(item => item.id != applet.id);
    state.fullDirectory = state.fullDirectory.filter(item => item.id != applet.id);
  },
  setFromLibrary(state, fromLibrary) {
    state.fromLibrary = fromLibrary;
  },
  cacheAppletBuilderData(state, appletBuilderData) {
    state.currentAppletBuilderData = appletBuilderData;
  },
};

const getters = {
  isLoggedIn (state) {
    return !_.isEmpty(state.auth)
  },
};

const stateCopy = (({ 
  // Excluded properties.
  currentLanguage,
  ...o
}) => o)(state);
const stateToPersist = Object.keys(stateCopy);

export const storeConfig = {
  state,
  getters,
  mutations,
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      paths: stateToPersist,
    }),
  ],
};

const store = new Store(storeConfig);

export default store;
