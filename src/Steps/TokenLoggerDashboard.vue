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

    <!-- Alert message -->
    <v-card>
      <v-card-text>
        This is a message about an unusual activity. It could be either
        negative or positive. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit, sed do eiusmod tempor incididun utabore et dolore
        magna aliqua.
      </v-card-text>
    </v-card>

    <v-card class="chart-card">
      <header>
        <h5>Overview</h5>
      </header>

      <overview-chart
        v-if="status === 'ready'"
        :data='overviewData'
        :features='overviewFeatures'
      />
    </v-card>

    <v-card
      class="chart-card"
      v-for="chart in charts"
    >
      <header>
        <h5>{{ chart.title }}</h5>
      </header>

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

.v-card {
  margin-bottom: 1.5rem;
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

.chart-card {
  padding: 1.5rem;
}
</style>

<script>
import _ from "lodash";
import api from "../Components/Utils/api/api.vue";
import Activity from '../models/Activity.js';
import BarChart from "../Components/Charts/BarChart.vue";
import OverviewChart from "../Components/Charts/OverviewChart.vue";


export default {
  name: "TokenLoggerDashboard",

  /**
   * Components that this component depends on.
   */
  components: {
    BarChart,
    OverviewChart,
  },

  /**
   * Component state.
   */
  data: () => ({
    status: "loading",

    charts: [],
    responses: [],
    overviewData: [],
    overviewFeatures: [],
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
          users: this.$store.state.currentUsers,
        });

        this.responses = await this.formatResponseData(
          response.data
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

        this.overviewFeatures.push(activity.question['en']);

        activitiesData[activityUrl].forEach(response => {
          response.date = new Date(response.date);

          if (response.value.length > 0) {
            this.overviewData.push({
              activity: activity.question['en'],
              date: response.date,
            });
          }

          response.value.forEach(value => {
            const behaviour = chart.features[value].name;

            date = chart.data.find(d =>
              d.date.getTime() === response.date.getTime()
            );

            if (!date) {
              date = { date: response.date };
              chart.data.push(date);
            }

            if (behaviour in date) {
              date[behaviour] += value;
            } else {
              date[behaviour] = value;
            }
          })
        });
      }

      this.charts.push(chart);
    }
  },
};
</script>
