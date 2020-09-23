import Vue from "vue";
import VueI18n from "vue-i18n";
import store from "../State/state";
import _ from "lodash";

import en_US from "./locales/en_US";
import fr_FR from "./locales/fr_FR";

Vue.use(VueI18n);

// detect browser language
const browserLanguage = (() => {
  const language = navigator.language || navigator.userLanguage;

  if (
    ["fr", "fr-BE", "fr-CA", "fr-CH", "fr-FR", "fr-LU", "fr-MC"].includes(
      language
    )
  ) {
    return "fr_FR";
  }

  return "en_US";
})();

// check if a language setting is stored already
const locale = _.get(store, "state.currentLanguage", browserLanguage);

// new instance
export default new VueI18n({
  locale,
  messages: {
    en_US,
    fr_FR,
  },
});
