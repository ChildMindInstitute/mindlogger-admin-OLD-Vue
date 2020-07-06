<template>
  <div class="wrapper">
    <v-row justify="space-between" align="center">
      <!-- Breadcrumb navigation -->
      <v-breadcrumbs
        :items="breadcrumbs()"
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


    <div
      v-if="applet"
      v-for="activity in applet.activities"
    >
      <h5>{{ activity.description.en || activity.question.en }}</h5>

      <v-card
        class="chart-card"
        v-for="item in activity.items"
      >
        <header>
          <h5>{{ item.label.en }}</h5>
        </header>

        <token-chart
          plot-id="token-chart"
          :data="item.chartData.data"
          :features="item.chartData.features"
        />
      </v-card>
    </div>
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
import Applet from '../models/Applet';
import Activity from '../models/Activity';
import Item from '../models/Item';
import TokenChart from "../Components/Charts/TokenChart.vue";
import OverviewChart from "../Components/Charts/OverviewChart.vue";


export default {
  name: "TokenLoggerDashboard",

  /**
   * Components that this component depends on.
   */
  components: {
    TokenChart,
    OverviewChart,
  },

  /**
   * Component state.
   */
  data: () => ({
    status: "loading",
    applet: {
      _id: '',
      label: { en: 'Applet' },
      activities: [],
    },
    charts: [],
    responses: [],
    overviewData: [],
    overviewFeatures: [],
  }),

  /**
   * Computed properties.
   */
  computed: {
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
    this.fetchAppletData();
    //this.getUserResponses();
    //this.formatResponseData();
  },

  /**
   * Component methods.
   */
  methods: {
    breadcrumbs() {
      const appletName = this.applet.label.en;
      const appletId = this.applet._id;

      return [
        { text: 'All', to: '/' },
        { text: appletName, to: `/${appletId}/users` },
        { text: 'Dashboard', disabled: true },
      ];
    },

    async fetchAppletData() {
      this.applet = await Applet.fetchById(this.$route.params.appletId);

      for (let activityName in this.applet.data.activities) {
        const activity = new Activity(this.applet.data.activities[activityName]);

        for (let i = 0, l = activity.order.length; i < l; i++) {
          const item = new Item(this.applet.data.items[activity.order[i]]);

          item.chartData = {
            data: [
              {
                date: new Date(2020, 6, 2),
                'Brushed teeth': 1,
                'Used foul language': 0,
                'Showed agression': -4,
                'Paid attention': 1,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 3),
                'Brushed teeth': 1,
                'Used foul language': -2,
                'Showed agression': -4,
                'Paid attention': 0,
                'Cleaned room': 3,
              },
              {
                date: new Date(2020, 6, 4),
                'Brushed teeth': 1,
                'Used foul language': -2,
                'Showed agression': 0,
                'Paid attention': 2,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 5),
                'Brushed teeth': 1,
                'Used foul language': 0,
                'Showed agression': 0,
                'Paid attention': 2,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 6),
                'Brushed teeth': 1,
                'Used foul language': 0,
                'Showed agression': 0,
                'Paid attention': 2,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 7),
                'Brushed teeth': 0,
                'Used foul language': 0,
                'Showed agression': 0,
                'Paid attention': 0,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 8),
                'Brushed teeth': 1,
                'Used foul language': 0,
                'Showed agression': -4,
                'Paid attention': 2,
                'Cleaned room': 0,
              },
              {
                date: new Date(2020, 6, 9),
                'Brushed teeth': 1,
                'Used foul language': 0,
                'Showed agression': 0,
                'Paid attention': 2,
                'Cleaned room': 3,
              },
            ],

            //features: [
            //  {
            //    name: 'Paid attention',
            //    value: 2,
            //    color: '#4b7bec',
            //  },
            //  {
            //    name: 'Cleaned room',
            //    value: 3,
            //    color: '#2B87C6',
            //  },
            //  {
            //    name: 'Brushed teeth',
            //    value: 1,
            //    color: '#778ca3',
            //  },
            //  {
            //    name: 'Used foul language' ,
            //    value: -2,
            //    color: '#E91E63',
            //  },
            //  {
            //    name: 'Showed agression' ,
            //    value: -4,
            //    color: '#F44336',
            //  }
            //],

            /*
            // Map of possible behaviours.
            features: item.responseOptions.reduce(
              (obj, option) => {
                obj[option.value] = {
                  name: option.name['en'],
                  value: option.value,
                  color: option.color,
                };
                return obj;
              }, {}
            ),
            */
          };

          // Generate random chart data data.



          activity.items.push(item);
        }

        this.applet.activities.push(activity);
        this.overviewFeatures.push(activity.question['en']);

        //activity.fetchResponses();
      }
    },

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

      for (let activityUrl in activitiesData) {
        chart.title = activity.question['en'];

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
            const behavior = chart.features[value].name;

            date = chart.data.find(d =>
              d.date.getTime() === response.date.getTime()
            );

            if (!date) {
              date = { date: response.date };
              chart.data.push(date);
            }

            date[behavior] = value;
          })
        });
      }

      this.charts.push(chart);
    }
  },
};
</script>
