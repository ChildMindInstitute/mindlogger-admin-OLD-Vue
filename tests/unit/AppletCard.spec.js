import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import AppletCard from '../../src/Components/Applets/AppletCard.vue';
import { storeConfig } from '../../src/State/state.js';
import i18n from '../../src/plugins/language'

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store(cloneDeep(storeConfig));

test('AppletCard\'s \'currentApplet\' computed property', () => {

  const sampleApplet1 = { 
    'applet': { 
      '_id': 'testAppletId1', 
    },
    'roles': ['coordinator'],
  };
  const sampleApplet2 = { 
    'applet': { 
      '_id': 'testAppletId2', 
    },
    'roles': ['reviewer'],
  };
  
  // Create an instance of the AppletCard component
  // pass sampletApplet2 as the applet prop
  const wrapper = shallowMount(AppletCard, {
    store,
    localVue,
    propsData: {
      applet: sampleApplet2,
    },
    i18n
  });

  // Set the app's current applet to sampletApplet1
  store.commit('setCurrentApplet', sampleApplet1);

  // Since the app's current applet doesn't match the component's
  // applet prop, currentApplet should be false
  expect(wrapper.vm.currentApplet).toBe(false);

  // Set the app's current applet to sampletApplet2
  store.commit('setCurrentApplet', sampleApplet2);

  // Since the app's current applet matches the component's
  // applet prop, currentApplet should be true
  expect(wrapper.vm.currentApplet).toBe(true);
})
