<template>
  <div class="wrapper">
    <v-row justify="space-between" align="center">
      <!-- Breadcrumb navigation -->
      <v-breadcrumbs
        :items="breadcrumbs"
        large
      >
        <template v-slot:divider>
          <v-icon>mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <!-- Export button -->
      <v-btn
        rounded
        dark
        color="deep-purple accent-4"
        class="export-btn"
      >
        <v-icon>import_export</v-icon>
        EXPORT
      </v-btn>
    </v-row>

    <h4 class="section-title">Highlight</h4>

    <!-- Alert message -->
    <v-card>
      <v-card-text>
        This is a message about an unusual activity. It could be either
        negative or positive. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit, sed do eiusmod tempor incididun utabore et dolore
        magna aliqua.
      </v-card-text>
    </v-card>

    <h4 class="section-title">Activities</h4>

    <v-card
      class="chart-card"
      v-for="chart in charts"
    >
      <h5>{{ chart.title }}</h5>

      <bar-chart
        v-if="status === 'ready'"
        plot-id="token-chart"
        :data="chart.data"
        :features="chart.features"
      />
    </v-card>
  </div>
</template>

<style>
.container {
  background: #EFEFF2;
  height: 100%;
  width: 100%;
}

.wrapper {
  width: 90%;
  max-width: 1024px;
  margin: 2rem auto;
}

.v-breadcrumbs__item {
  color: #8728FB !important;
}

.v-breadcrumbs__item--disabled {
  color: #333 !important;
}

.export-btn {
  font-size: 0.8rem !important;
}

.export-btn .material-icons {
  font-size: 1rem !important;
  margin-right: 0.2rem;
}

.loading {
  text-align: center;
}

.section-title {
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.chart-card {
  padding: 1.5rem;
}
</style>

<script>
import _ from "lodash";
import api from "../Components/Utils/api/api.vue";
import Activity from '../models/Activity.js';
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
    status: "loading",

    charts: [],
    responses: [],
  }),

  /**
   * Computed properties.
   */
  computed: {
    breadcrumbs() {
      return [
        { text: 'All', to: '/' },
        { text: 'Applet', to: `/${this.currentApplet.applet._id}/users` },
        { text: 'Dashboard', disabled: true },
      ];
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
  mounted() {
    this.getUserResponses();
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
    async getUserResponses() {
      try {
        const response = await api.getUserResponses({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: this.$route.params.appletId,
          userId: this.$store.state.currentUsers[0],
        });

        this.responses = await this.formatResponseData(
          response.data.responses
        );
        this.status = "ready";
      } catch(error) {
        this.status = "error";
        this.error = error;
        console.error(error);
      }
    },

    /**
     * Formats response data for the histagram.
     *
     * @return {void}
     */
    async formatResponseData(activitiesData) {
      let activity;
      let date;
      let chart = {
        title: '',
        data: [],
        features: {},
      };


      for (let activityUrl in activitiesData) {
        activity = await Activity.fetchByUrl(activityUrl);
        chart.title = activity.question['en'];

        // Create a list of all possible behaviours.
        chart.features = activity.choices.reduce(
          (obj, choice) => {
            obj[choice.value] = {
              name: choice.name['en'],
              value: choice.value,
              color: choice.color,
            };
            return obj;
          },
          {}
        );

        activitiesData[activityUrl].forEach(response => {
          response.value.forEach(value => {
            const behaviour = chart.features[value].name;
            response.date = new Date(response.date);

            date = chart.data.find(d =>
              d.date.getTime() === response.date.getTime()
            );

            if (!date) {
              date = { date: response.date };
              chart.data.push(date);
            }

            if (behaviour in date) {
              date[behaviour] += 1;
            } else {
              date[behaviour] = 1;
            }
          })
        });
      }

      this.charts.push(chart);
    }
  },
};
</script>
