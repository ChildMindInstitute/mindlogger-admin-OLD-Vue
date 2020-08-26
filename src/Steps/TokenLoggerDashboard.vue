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

    <div v-if="status !== 'ready'">
      {{ status }}
    </div>

    <div
      v-else
      v-for="activity in applet.activities"
    >
      <h4 class="activity-header">{{ activity.question.en || activity.description.en }}</h4>

      <v-card
        class="chart-card"
        v-for="item in activity.items"
      >
        <header>
          <h5>{{ item.description.en || item.label.en }}</h5>
        </header>

        <token-chart
          plot-id="token-chart"
          :minValue="item.minValue"
          :maxValue="item.maxValue"
          :data="item.responses"
          :features="item.responseOptions"
        />
      </v-card>
    </div>

    <div v-else>
      There's no data available for the selected users.
    </div>

    <v-btn
      color="primary"
      fixed
      bottom
      left
      @click="$router.go(-1)"
    >
      Back
    </v-btn>
  </div>
</template>

<style scoped>
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

.v-breadcrumbs {
  padding-left: 12px !important;
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

.activity-header {
  margin: 1.5rem 0;
}
</style>

<script>
import _ from "lodash";
import api from "../Components/Utils/api/api.vue";
import Applet from '../models/Applet';
import Activity from '../models/Activity';
import Item from '../models/Item';
import TokenChart from "../Components/Charts/TokenChart.vue";


export default {
  name: "TokenLoggerDashboard",

  /**
   * Components that this component depends on.
   */
  components: {
    TokenChart,
  },

  /**
   * Component state.
   */
  data: () => ({
    status: 'Initializing dashboard',
    applet: {
      _id: '',
      label: { en: 'Applet' },
      activities: [],
    },
    charts: [],
    responses: [],
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
  async mounted() {
    const { appletId } = this.$route.params;
    const { users } = this.$route.query;

    try {
      this.status = 'Loading applet data';
      this.applet = await Applet.fetchById(
        appletId,
        {
          withActivities: true,
          withResponses: true,
          users: Array.isArray(users) ? users : [users],
        },
      );
      this.status = 'ready';
    } catch(error) {
      this.status = 'Oops, something went wrong. We couldn\'t load the applet';
      this.error = error;
      console.error(error);
    }
  },

  /**
   * Component methods.
   */
  methods: {
    breadcrumbs() {
      const appletName = this.applet.label.en;
      const appletId = this.$route.params.appletId;

      return [
        { text: appletName, to: `/applet/${appletId}/users` },
        { text: 'Dashboard', disabled: true },
      ];
    },
  },
};
</script>
