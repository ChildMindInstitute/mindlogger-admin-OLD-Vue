import AppletCard from '../../src/Components/Applets/AppletCard.vue';

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import { storeConfig } from '../../src/State/state.js';
import { cloneDeep } from 'lodash';

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store(cloneDeep(storeConfig));

test('sets current applet when selected', () => {

  const sampleApplet1 = { 
    'applet': { 
      '_id': 'testAppletId1', 
    } 
  };
  const sampleApplet2 = { 
    'applet': { 
      '_id': 'testAppletId2', 
    } 
  };
  store.commit('setCurrentApplet', sampleApplet1);
  expect(store.state.currentApplet).toBe(sampleApplet1); 

  const wrapper = shallowMount(AppletCard, {
    store,
    localVue,
    propsData: {
      applet: sampleApplet2,
    }
  });

  expect(wrapper.vm.status).toBe('ready')
})