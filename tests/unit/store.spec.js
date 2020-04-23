import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { storeConfig } from '../../src/State/state.js';
import { cloneDeep } from 'lodash';

function getLocalStore() {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  const store = new Vuex.Store(cloneDeep(storeConfig));
  return store;
}


test('sets "backend" value when "setBackend" is committed', () => { 
  const store = getLocalStore();
  const sampleBackend = 'sample.backend.com/api/v1';
  store.commit('setBackend', sampleBackend);
  expect(store.state.backend).toBe(sampleBackend);
});

test('sets "currentApplet" value when "setCurrentApplet" is committed', () => { 
  const store = getLocalStore(); 
  const sampleApplet = { 
    'applet': { 
      '_id': 'testAppletId', 
    } 
  }; 
  store.commit('setCurrentApplet', sampleApplet); 
  expect(store.state.currentApplet).toBe(sampleApplet); 
}); 

test('sets "allApplets" value when "setAllApplets" is committed', () => { 
  const store = getLocalStore(); 
  const sampleAppletArray = [ 
    { 
      'applet': { 
        '_id': 'testAppletId1',
      },
    }, 
    { 
      'applet': { 
        '_id': 'testAppletId2',
      },
    }, 
  ]; 
  store.commit('setAllApplets', sampleAppletArray); 
  expect(store.state.allApplets).toMatchObject(sampleAppletArray); 
}); 

test('sets "auth" value when "setAuth" is committed', () => { 
  const store = getLocalStore(); 
  const sampleAuth = { 
    'token': 'xxx', 
  }; 
  store.commit('setAuth', sampleAuth); 
  expect(store.state.auth).toBe(sampleAuth); 
}); 

test('sets "currentUsers" value when "setCurrentUsers" is committed', () => { 
  const store = getLocalStore(); 
  const sampleUsers = [ 
    'user1', 
    'user2', 
  ]; 
  store.commit('setCurrentUsers', sampleUsers); 
  expect(store.state.currentUsers).toBe(sampleUsers); 
}); 

test('sets "users" value when "setAuth" is committed', () => { 
  const store = getLocalStore(); 
  const sampleUsers = [ 
    'user1', 
    'user2', 
  ]; 
  store.commit('setUsers', sampleUsers); 
  expect(store.state.users).toBe(sampleUsers); 
}); 

test('sets "reviewers" value when "setReviewers" is committed', () => {
  const store = getLocalStore();
  const sampleReviewers = [
    'user1',
    'user2',
  ]; 
  store.commit('setReviewers', sampleReviewers); 
  expect(store.state.reviewers).toBe(sampleReviewers);
});