import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { storeConfig } from '../../src/State/state.js';
import { cloneDeep } from 'lodash';

test('sets "backend" value when "setBackend" is committed', () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  const store = new Vuex.Store(cloneDeep(storeConfig));
  const sampleBackend = 'sample.backend.com/api/v1';
  store.commit('setBackend', sampleBackend);
  expect(store.state.backend).toBe(sampleBackend);
});