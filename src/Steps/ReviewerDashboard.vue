<template>
  <v-card class="container">
    <div
      v-if="loading"
      class="status-message"
    >
      {{ status }}
    </div>

    <div
      v-else
    >
      <v-card>
        <v-tabs
          v-model="selectedTab"
          background-color="white"
          color="black"
          light
          left
        >
          <template v-for="tab in tabs">
            <v-tab
              :key="tab"
            >
              {{ $t(tab) }}
            </v-tab>
          </template>
        </v-tabs>

        <div class="time-range">
          {{ $t('showingDataFrom') }}

          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn 
                depressed
                class="ds-button-tall ma-0 mb-2 fromDate"
                v-on="on"
              >
                {{ fromDate }}
              </v-btn>
            </template>

            <v-date-picker
              :locale="$i18n.locale.slice(0, 2)"
              no-title
              :allowedDates="isAllowedStartDate"
              @change="setStartDate"
            />
          </v-menu>

          {{ $t('to') }}

          <v-menu>
            <template v-slot:activator="{ on }">
              <v-btn 
                depressed
                class="ds-button-tall ma-0 mb-2 toDate"
                v-on="on"
              >
                {{ toDate }}
              </v-btn>
            </template>

            <v-date-picker
              :locale="$i18n.locale.slice(0, 2)"
              no-title
              :allowedDates="isAllowedEndDate"
              @change="setEndDate"
            />
          </v-menu>
        </div>

        <div class="version">
          <v-select
            class="version-list"
            v-model="selectedVersions"
            :items="appletVersions"
            :label="$t('versions')"
            multiple
          />

          <v-checkbox
            class="version-bar"
            v-model="hasVersionBars"
            :label="$t('showVersionChanges')"
          />
        </div>
      </v-card>

      <v-tabs-items v-model="selectedTab">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab"
        >
          <v-card>
            <v-expansion-panels
              v-model="panel"
              focusable
            >
              <template
                v-for="activity in applet.activities"
              >
                <v-expansion-panel
                  v-if="applet"
                  :key="activity._id"
                >
                  <v-expansion-panel-header>
                    {{ activity.label.en || activity.description.en }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div
                      v-for="item in activity.items"
                      :key="item['id']"
                      class="chart-card"
                    >
                      <header>
                        <h3> - {{ item.question.en || item.description.en }}</h3>
                      </header>

                      <token-chart
                        v-if="tab=='tokens' && item.isTokenItem"
                        :plot-id="item['id']"
                        :data="item.responses"
                        :features="item.responseOptions"
                        :versions-by-date="item.dateToVersions"
                        :versions="applet.versions"
                        :timezone="item.timezoneStr"
                        :focus-extent="focusExtent"
                        :selected-versions="selectedVersions"
                        :has-version-bars="hasVersionBars"
                        @onUpdateFocusExtent="onUpdateFocusExtent"
                      />
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-expansion-panel
                  v-else
                  :key="activity._id"
                >
                    {{ $t("noDataAvailable") }}
                </v-expansion-panel>
              </template>
            </v-expansion-panels>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.container {
  max-height: calc(100vh - 120px);
  overflow-y: scroll;
  background-color: white;
  padding: 20px;
}

.time-range,
.version {
  margin-top: 0.8rem;
  margin-left: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
}

.version {
  .version-list, .version-bar {
    display: inline-block;
  }

  .version-list {
    width: 50%;
  }
  .version-bar {
    margin-left: 20px;
  }
}

.time-range .date {
  margin: 0 0.3rem;
  color: #1976D2;
}

.wrapper {
  width: 90%;
  margin: 1rem auto;
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

.status-message {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #ccc;
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
import Applet from "../models/Applet";
import Activity from "../models/Activity";
import Item from "../models/Item";
import TokenChart from "../Components/Charts/TokenChart.vue";
import * as moment from 'moment';

export default {
  name: "ReviewerDashboard",

  /**
   * Components that this component depends on.
   */
  components: {
    TokenChart,
  },

  /**
   * Component state.
   */
  data: function() {
    const NOW = new Date();
    const TODAY = new Date(Date.UTC(
      NOW.getFullYear(),
      NOW.getMonth(),
      NOW.getDate() + 1,
      0,
      0,
      0,
    ));

    const ONE_WEEK_AGO = new Date(TODAY);
    ONE_WEEK_AGO.setDate(TODAY.getDate() - 6);

    return {
      loading: true,
      status: "Initializing dashboard",
      applet: {
        _id: "",
        label: { en: "Applet" },
        activities: [],
        versions: [],
      },
      responses: [],
      selectedTab: 0,
      panel: 0,
      tabs: ['responses', 'tokens'],
      focusExtent: [ONE_WEEK_AGO, TODAY],
      selectedVersions: [],
      hasVersionBars: false,
    }
  },

  /**
   * Computed properties.
   */
  computed: {
    appletVersions() {
      return this.applet.versions.map(version => version.version)
    },
    currentApplet() {
      return this.$store.state.currentAppletData;
    },
    fromDate() {
      return moment.utc(this.focusExtent[0]).format('ddd, D MMM YYYY');
    },
    toDate() {
      return moment.utc(this.focusExtent[1]).format('ddd, D MMM YYYY');
    },
  },

  /**
   * Handlers to be executed each time a property changes its value.
   */
  watch: {},

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  async mounted() {
    const { appletId } = this.$route.params;
    const { users } = this.$route.query;

    try {
      this.status = "Loading applet data";
      this.applet = await Applet.fetchById(
        appletId,
        {
          withActivities: true,
          withResponses: true,
          withVersions: true,
          users: Array.isArray(users) ? users : [users],
        },
        this.$store.state.currentAppletData.applet.encryption
      );

      this.selectedVersions = this.appletVersions;

      this.loading = false;
    } catch (error) {
      this.status = "Oops, something went wrong. We couldn't load the applet";
      this.error = error;
      console.error(error);
    }
  },

  /**
   * Component methods.
   */
  methods: {
    /**
     * Checks whether the given date should be enabled.
     *
     * @param {string} date a given date.
     * @return {boolean} whether this options should be enabled.
     */
    isAllowedStartDate(date) {
      return moment.utc(date) < this.focusExtent[1];
    },

    /**
     * Checks whether the given date should be enabled.
     *
     * @param {string} date a given date.
     * @return {boolean} whether this options should be enabled.
     */
    isAllowedEndDate(date) {
      return (
        (moment.utc(date) > this.focusExtent[0]) && 
        (moment.utc(date) <= moment.utc())
      );
    },
    /**
     * Updates the start date for the focused time range.
     *
     * @param {string} date the new start date.
     * @returns {void}
     */
    setStartDate(date) {
      this.$set(this.focusExtent, 0, moment.utc(date).toDate());
    },
    /**
     * Updates the end date for the focused time range.
     *
     * @param {string} date the new end date.
     * @returns {void}
     */
    setEndDate(date) {
      this.$set(this.focusExtent, 1, moment
        .utc(date)
        .add(15, 'hours')
        .toDate()
      );
    },

    onUpdateFocusExtent(focusExtent) {
      this.$set(this, 'focusExtent', focusExtent);
    }
  },
};
</script>
