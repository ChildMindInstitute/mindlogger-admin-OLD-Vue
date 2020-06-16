import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { Store } from "vuex";
import _ from 'lodash';
import createPersistedState from "vuex-persistedstate";
import api from "../Components/Utils/api/api.vue";

const getDefaultState = () => {
  console.log(process.env)
  return {
    backend: 'https://api-staging.mindlogger.org/api/v1',
    allApplets: [],
    cachedEvents: [],
    currentApplet: {},
    removedEvents: [],
    updatedEvents: [],
    auth: {},
    continue: {},
    currentUsers: [],
    userEmail: "",
    users: {},
  }
}

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
      {'url': 'https://api-prod.mindlogger.org/api/v1', 'env': 'production'},
      {'url': 'https://api-staging.mindlogger.org/api/v1', 'env': 'development'},
      {'url': 'https://api-test.mindlogger.org/api/v1', 'env': 'staging'},
      {'url': 'http://localhost:8080/api/v1', 'env': 'local'},
      {'url': process.env.CUSTOM_URL || '', 'env': 'other'}
    ]
    state.backend = backend ||
      _.find(backendServers, {'env': process.env.NODE_ENV}).url ||
      backendServers[0].url;
  },
  setCurrentApplet(state, protocol) {

    if (protocol) {
      state.currentApplet = protocol;
    }
  },
  setAllApplets(state, protocols) {
    // Remove `activities` and `items` from each applet to save localStorage space
    const protocolsWithoutItems = _.map(protocols, function(protocol) {
        return {
          ...protocol,
          items: undefined,
        };
    });
    state.allApplets = protocolsWithoutItems;
  },
  updateAllApplets(state) {
    const applets = state.allApplets;
    for (let i = 0; i < applets.length; i ++) {
      api.getSchedule({
        apiHost: state.backend,
        token: state.auth.authToken.token,
        id: applets[i].applet._id.split("applet/")[1],
      })
      .then((res) => {
        state.allApplets[i].applet.schedule = res.data;
      })
      .catch((err) => {
        console.log('error', err);
      })
    }
  },
  // setCachedApplet(state, applet) {
  //   state.cachedApplets = state.allApplets;
  //   if (applet) {
  //     state.cachedApplets[state.currentApplet.applet._id] = state.currentApplet;
  //   }
  // },
  setApplet(state, applet) {
    if (applet) {
      state.currentApplet.applet = applet;
    }
  },
  setAuth(state, userData) {
    state.auth = userData.auth;
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
      const idx = _.findIndex(state.allApplets,
        a => a.applet._id == state.currentApplet.applet._id);
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
    const idx = _.findIndex(state.allApplets,
      a => a.applet['skos:prefLabel'] == state.currentApplet.applet['skos:prefLabel']);
    if (idx > -1) {
      state.allApplets[idx].groups = groups;
    }
    // update this in the copy too.
    state.currentApplet = {...state.currentApplet, groups };
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
  continue(state, params) {
    state.continue[params.component] = params.continue;
  }
};

export const storeConfig = {
  state,
  mutations,
  plugins: [
    createPersistedState({ storage: window.sessionStorage }),
  ],
};

const store = new Store(storeConfig);

// store.commit('setBackend', null)

export default store;
