import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { Store } from "vuex";
import _ from 'lodash';
import createPersistedState from "vuex-persistedstate";
import api from "../Components/Utils/api/api.vue";

const state = {
  backend: 'https://api.mindlogger.org/api/v1',
  allApplets: [],
  currentApplet: {},
  auth: {},
  continue: {},
  currentUsers: [],
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
      
      const savedApplet = localStorage.getItem(state.currentApplet.applet._id);
      if(savedApplet) {
        state.currentApplet.applet = JSON.parse(savedApplet);
      }
    }
  },
  setAllApplets(state, protocols) {
    state.allApplets = protocols;
  },
  setApplet(state, applet) {
    if(applet) {
      state.currentApplet.applet = applet;
    }
  },
  setAuth(state, auth) {
    state.auth = auth;
  },
  // Just for now
  // loadSchedule(state) {
  //   api
  //     .refreshApplet({
  //       apiHost: state.backend,
  //       appletId: state.currentApplet.applet._id.split('applet/')[1],
  //       token: state.auth.authToken.token,
  //     })
  //     .then((response) => {
  //       //state.currentApplet.applet.schedule = response.data.applet.schedule;
  //     })
  //     .catch(e => {
  //       console.log("fail", e);
  //     });
  // },
  setSchedule(state, schedule) {
    if (!_.isEmpty(state.currentApplet)) {
      // TODO: this sucks.
      const idx = _.findIndex(state.allApplets,
        a => a.applet._id == state.currentApplet.applet._id);
      if (idx > -1) {
        // console.log("$$$$", schedule);
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
    createPersistedState(),
  ],
};

const store = new Store(storeConfig);

export default store;
