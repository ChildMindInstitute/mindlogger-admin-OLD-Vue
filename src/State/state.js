import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import { Store } from "vuex";
// import createPersistedState from 'vuex-persistedstate';
import _ from 'lodash';

const state = {
  backend: 'https://api.mindlogger.org/api/v1',
  allApplets: [],
  currentApplet: {},
  auth: {},
  continue: {},
  users: {},
};

const mutations = {
  setBackend(state, backend) {
    if (backend !== state.backend) {
      state.auth = {};
    }
    state.backend = backend;
  },
  setCurrentApplet(state, protocol) {
    if (protocol) {
      state.currentApplet = protocol;
    }
  },
  setAllApplets(state, protocols) {
    state.allApplets = protocols;
  },
  setAuth(state, auth) {
    state.auth = auth;
  },
  setSchedule(state, schedule) {
    if (!_.isEmpty(state.currentApplet)) {
      // TODO: this sucks.
      // const idx = _.findIndex(state.allApplets,
      //   a => a.applet['skos:prefLabel'] == state.currentApplet.applet['skos:prefLabel']);
      const idx = _.findIndex(state.allApplets,
        a => a.applet._id == state.currentApplet.applet._id);
      if (idx > -1) {
        console.log(idx, state.allApplets[idx].applet);
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

const store = new Store({
  state,
  mutations,
  // plugins: [createPersistedState()],
})

export default store;
