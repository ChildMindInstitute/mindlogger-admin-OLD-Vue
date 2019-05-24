import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import { Store } from "vuex";

const state = {
  backend: '',
  activitySet: '',
  auth: {},
  schedule: {},
  groups: [],
  users: [],
  reviewers: [],
  continue: {},
};

const mutations = {
  setBackend(state, backend) {
    state.backend = backend;
  },
  setActivitySet(state, activitySet) {
    state.activitySet = activitySet;
  },
  setAuth(state, auth) {
    state.auth = auth;
  },
  setSchedule(state, schedule) {
    state.schedule = schedule;
  },
  setGroups(state, groups) {
    state.groups = groups;
  },
  setUsers(state, users) {
    state.users = users;
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
})

export default store;