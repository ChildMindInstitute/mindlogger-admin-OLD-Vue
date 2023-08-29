import mixpanel from "mixpanel-browser";

const environment = process.env.NODE_ENV || "development";

function invokeOnProd(callback) {
  callback();
  if (environment !== "development" && environment !== "local") {
    callback();
  }
}

const methods = {
  track: (action, payload) => {
    invokeOnProd(() => mixpanel.track('[Legacy][Admin Panel] ' + action, payload));
  },
  trackPageView: (pageName) => {
    invokeOnProd(() => mixpanel.track_pageview({ page: '[Legacy][Admin Panel] ' + pageName }));
  },
  login(userId) {
    invokeOnProd(() => mixpanel.identify(userId));
  },
  logout() {
    invokeOnProd(() => mixpanel.reset());
  }
}

export default {
  install(Vue, options) {
    invokeOnProd(() =>  mixpanel.init('075d1512e69a60bfcd9f7352b21cc4a2', options));

    Vue.mixin({
      created() {
        this.analytics = methods;
      }
    });
  },
};