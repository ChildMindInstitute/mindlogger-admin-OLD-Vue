// Third-party libraries.
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import _ from 'lodash';

// Local.
import store from '../State/state';

// Translations.
import en_US from './locales/en_US';
import fr_FR from './locales/fr_FR';


Vue.use(VueI18n);

const DEFAULT_LANG = 'en_US';

/**
 * Returns the full ISO code for the language;
 *
 * @param {string} any language code.
 * @returns {string} the full language ISO code.
 */
export const getLanguageCode = (language) => {
  if (!language) return DEFAULT_LANG;

  if (language.startsWith('fr')) { 
    return 'fr_FR';
  }

  return DEFAULT_LANG;
};

// Detect language in the URL.
const queryString = window.location.hash.split('?').pop();
const urlParams = new URLSearchParams(queryString);
const urlLanguage = urlParams.get('lang');


// Initialize the extended Vue instance. 
export default new VueI18n({
  locale: (
    getLanguageCode(urlLanguage) ||
    _.get(store, 'state.currentLanguage') ||
    getLanguageCode(navigator.language || navigator.userLanguage)
  ),
  messages: {
    en_US,
    fr_FR,
  },
});
