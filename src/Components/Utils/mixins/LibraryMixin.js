import api from "../api/api.vue";
import { version } from "../../../../package.json";
import { get, difference } from "lodash";

export const LibraryMixin = {
  computed: {
    apiHost() {
      return this.$store.state.backend;
    },
    token() {
      return this.$store.state.auth.authToken.token;
    },
  },
  methods: {
    async loadBasketApplets() {
      const { data: basketApplets } = await api.getBasketContent({
        apiHost: this.apiHost,
        token: this.token
      });

      Object.values(basketApplets).forEach(applet => {
        const activities = Object.values(applet.activities).map(activity => activity['@id'])

        Object.entries(applet.activityFlows).forEach(([key, flow]) => {
          const flowActivities = get(flow, ['reprolib:terms/order', 0, '@list']).map(activity => activity['@id'])
          
          if(difference(flowActivities, activities).length) {
            let activityFlowOrder = get(applet, ['applet', 'reprolib:terms/activityFlowOrder', 0, '@list'])
            activityFlowOrder.splice(activityFlowOrder.findIndex(flowFromOrder => (flowFromOrder['@id'] === key)), 1)
            delete applet.activityFlows[key]
          }
        });
      });

      this.$store.commit('setBasketApplets', basketApplets);
    },
  }
}

export const getVersion = () => {
  return version;
}
