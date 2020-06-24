<template>
  <div class="wrapper">
    <h1>Applet Dashboard</h1>

    <bar-chart
      plot-id="token-chart"
      :data="chartData"
      :features="chartKeys"
    />
  </div>
</template>

<style scoped>
.container {
  background: #EFEFF2;
  height: 100%;
  width: 100%;
}
.loading {
  text-align: center;
}
</style>

<script>
import _ from "lodash";
import api from "../Components/Utils/api/api.vue";
import BarChart from "../Components/Charts/BarChart.vue";

export default {
  name: "SetUsers",

  /**
   * Components that this component depends on.
   */
  components: {
    BarChart,
  },

  /**
   * Component state.
   */
  data: () => ({
    status: "ready", // TODO: Change this to loading.
    chartData: [],
    chartKeys: [],
  }),

  /**
   * Computed properties.
   */
  computed: {
    isTokenDataLoaded() {
      return this.$store.state.tokens.length > 0;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },

  /**
   * Handlers to be executed each time a property changes its value.
   */
  watch: {

  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  created() {
    //this.getTokenData();
    //this.formatResponseData();
  },

  /**
   * Component methods.
   */
  methods: {
    /**
     * Fetches the user response data for the current applet.
     *
     * @return {void}
     */
    getTokenData() {
      api
        .getUserResponses({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.$route.params.appletId
        })
        .then(resp => {
          this.status = "ready";
          this.$store.commit("setAppletResponses", resp.data);
        })
        .catch(e => {
          this.status = "error";
          this.error = e;
        });
    },

    /**
     * Formats response data for the histagram.
     *
     * @return {void}
     */
    formatResponseData(responses) {
      let behaviour;
      let date;

      for (let key in responses) {
        // Behaviour key without the URL.
        behaviour = key.split('/').pop();

        // Create a list of all possible behaviours.
        if (!this.chartKeys.includes(behaviour)) {
          this.chartKeys.push(behaviour);
        }

        //
        responses[key].forEach(item => {
          if (typeof item.value !== 'number') return;
          item.date = new Date(item.date);

          date = this.chartData.find(d => d.date.getTime() ===
            item.date.getTime());

          if (!date) {
            date = { date: item.date };
            this.chartData.push(date);
          }

          if (behaviour in date) {
            date[behaviour] += item.value;
          } else {
            date[behaviour] = item.value;
          }
        });
      }
    }
  },
};
</script>
