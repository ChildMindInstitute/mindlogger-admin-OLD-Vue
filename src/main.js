import Vue from "vue";
import DaySpanVuetify from "dayspan-vuetify-2";
import VuetifyDialog from "vuetify-dialog";
import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";

import router from "./router";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import i18n from "./plugins/language";

import "vuetify-dialog/dist/vuetify-dialog.min.css";

// const Vuetify = new vuetify({
//   theme: {dark: true}
// })
Vue.config.productionTip = false;
const environment = process.env.NODE_ENV || "development";

// Avoid using sentry for development since it is not needed and it would waste
// the log entries quota.
if (environment !== "development" && environment !== "local") {
  Sentry.init({
    environment,
    dsn:
      "https://3ee572fdc2af4938a5569d62d8389996@o414302.ingest.sentry.io/5313178",
    integrations: [new VueIntegration({ Vue, attachProps: true })],
  });
}

Vue.use(DaySpanVuetify, {
  data: {
    eventHeight: 20,
  },
  methods: {
    getDefaultEventColor: () => "#1976d2",
  },
});

Vue.use(VuetifyDialog, {
  context: {
    vuetify,
  },
});

new Vue({
  el: "#app",
  i18n,
  router,
  vuetify,
  render: (h) => h(App),
});
