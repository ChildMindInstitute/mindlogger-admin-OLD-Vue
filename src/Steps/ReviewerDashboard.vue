<template>
  <div class="container">
    <v-card class="dashboard">
      <div
        v-if="loading"
        class="status-message"
      >
        {{ status }}
      </div>

      <div
        v-else
      >
        <div>
          <v-tabs
            v-model="selectedTab"
            background-color="white"
            class="tabs"
            hide-slider
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
        </div>

        <div class="content">
          <div class="content-header">
            <div class="time-range">
              <v-menu>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    depressed
                    class="ds-button-tall mr-2 ml-2 mb-2 fromDate"
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
                    class="ds-button-tall mr-2 ml-2 mb-2 toDate"
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
                v-model="selectedVersions"
                class="version-list"
                :items="appletVersions"
                :label="$t('versions')"
                multiple
              />
            </div>
          </div>

          <div ref="panels">
            <v-tabs-items v-model="selectedTab">
              <v-tab-item
                v-for="tab in tabs"
                :key="tab"
              >
                <v-card class="mb-0">
                  <v-expansion-panels
                    v-model="applet.selectedActivites"
                    multiple
                    focusable
                  >
                    <v-expansion-panel v-if="tab=='tokens'">
                      <v-expansion-panel-header>
                        <div>
                          {{ applet.label.en }}
                        </div>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <token-chart
                          :plot-id="`Token-${applet.id.replace(' ', '_')}`"
                          :applet="applet"
                          :cumulative="applet.tokens"
                          :timezone="applet.timezoneStr"
                          :versions="applet.versions"
                          :focus-extent="focusExtent"
                          :selected-versions="selectedVersions"
                          :has-version-bars="hasVersionBars"
                          :parent-width="panelWidth"
                          @onUpdateFocusExtent="onUpdateFocusExtent"
                        />
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel
                      v-else
                      v-for="(activity, index) in applet.activities"
                      :key="index"
                    >
                      <v-expansion-panel-header>
                        <div 
                          v-if="!allExpanded && applet.activities.length > 1"
                          class="ds-expand-action"
                          @click.stop="onAllExpand"
                        >
                          <v-icon 
                            v-show="index === 0"
                            class="ds-expand-all" 
                            medium
                          >
                            mdi-chevron-up
                          </v-icon>
                          <v-icon 
                            v-show="index === 0"
                            class="ds-expand-all" 
                            medium
                          >
                            mdi-chevron-down
                          </v-icon>
                        </div>

                        <div 
                          v-if="allExpanded  && applet.activities.length > 1"
                          class="ds-expand-action"
                          @click.stop="onAllCollapsed"
                        >
                          <v-icon 
                            v-show="index === 0"
                            class="ds-expand-all" 
                            medium
                          >
                            mdi-chevron-down
                          </v-icon>
                          <v-icon 
                            v-show="index === 0"
                            class="ds-expand-all" 
                            medium
                          >
                            mdi-chevron-up
                          </v-icon>
                        </div>

                        <ActivitySummary
                          :plot-id="`Activity-Summary-${activity.slug}-${tab}`"
                          :versions="applet.versions"
                          :focus-extent="focusExtent"
                          :selected-versions="selectedVersions"
                          :has-version-bars="hasVersionBars"
                          :timezone="applet.timezoneStr"
                          :data="activity.responses"
                          :label="activity.label.en || activity.description.en"
                          :color="activity.dataColor"
                          :latest-score="activity.getLatestActivityScore()"
                          :frequency="activity.getFrequency()"
                          :sub-scales="activity.subScales"
                          :parent-width="panelWidth"
                          :item-padding="itemPadding"
                        />
                      </v-expansion-panel-header>
                      <v-expansion-panel-content
                        v-if="activity.responses && activity.responses.length && (tab !== 'tokens' || activity.hasTokenItem)"
                      >
                        <h2 class="mt-4">
                          {{ $t('responseOptions') }}
                        </h2>

                        <template
                          v-if="tab != 'tokens' && activity.subScales.length"
                        >
                          <SubScaleLineChart
                            v-if="activity.getFrequency() > 1"
                            :plot-id="`subscale-line-chart-${activity.slug}`"
                            :versions="applet.versions"
                            :focus-extent="focusExtent"
                            :selected-versions="selectedVersions"
                            :has-version-bars="hasVersionBars"
                            :timezone="applet.timezoneStr"
                            :activity="activity"
                            :parent-width="panelWidth"
                          />

                          <SubScaleBarChart
                            v-if="activity.getFrequency() == 1"
                            :plot-id="`subscale-bar-chart-${activity.slug}`"
                            :versions="applet.versions"
                            :focus-extent="focusExtent"
                            :selected-versions="appletVersions"
                            :has-version-bars="false"
                            :timezone="applet.timezoneStr"
                            :activity="activity"
                            :parent-width="panelWidth"
                          />
                        </template>

                        <v-expansion-panels
                          v-if="tab != 'tokens'"
                          v-model="activity.selectedSubScales"
                          class="mt-4 sub-scale"
                          focusable
                          multiple
                        >
                          <template
                            v-for="(subScale) in activity.subScales"
                          >
                            <v-expansion-panel
                              v-if="applet"
                              :key="subScale.variableName"
                            >
                              <v-expansion-panel-header>
                                <h4>
                                  {{ subScale.variableName }}
                                  ( {{ $t('latestScore') }}: {{ activity.getLatestSubScaleScore(subScale) }} )
                                </h4>
                              </v-expansion-panel-header>

                              <v-expansion-panel-content>
                                <div>
                                  <template
                                    v-for="item in subScale.items"
                                  >
                                    <div
                                      :key="item['id']"
                                      class="chart-card"
                                    >
                                      <header>
                                        <h3> - {{ item.getFormattedQuestion() }}</h3>
                                      </header>

                                      <RadioSlider
                                        v-if="tab == 'responses' && item.responseOptions && applet.selectedActivites.includes(index)"
                                        :plot-id="`RadioSlider-${activity.slug}-${subScale.slug}-${item.slug}`"
                                        :item="item"
                                        :versions="applet.versions"
                                        :focus-extent="focusExtent"
                                        :selected-versions="selectedVersions"
                                        :timezone="applet.timezoneStr"
                                        :has-version-bars="hasVersionBars"
                                        :parent-width="panelWidth"
                                        :color="item.dataColor"
                                      />
                                    </div>
                                  </template>
                                </div>
                              </v-expansion-panel-content>
                            </v-expansion-panel>
                          </template>
                        </v-expansion-panels>

                        <template
                          v-for="item in activity.items"
                        >
                          <div
                            v-if="item.allowEdit && (tab == 'tokens' || !item.partOfSubScale) && (tab != 'tokens' || item.isTokenItem)"
                            :key="item['id']"
                            class="chart-card"
                          >
                            <RadioSlider
                              v-if="tab == 'responses' && item.responseOptions && applet.selectedActivites.includes(index)"
                              :plot-id="`RadioSlider-${activity.slug}-${item.slug}`"
                              :item="item"
                              :versions="applet.versions"
                              :focus-extent="focusExtent"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :has-version-bars="hasVersionBars"
                              :parent-width="panelWidth"
                              :color="item.dataColor"
                            />
                          </div>
                        </template>
                      </v-expansion-panel-content>
                      <v-expansion-panel-content
                        v-else
                      >
                        <h4
                          v-if="tab != 'tokens'"
                          class="ma-4"
                        >
                          {{ $t("noDataAvailable") }}
                        </h4>
                        <h4
                          v-else
                        >
                          {{ $t("noTokenDataAvailable") }}
                        </h4>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.ds-expand-action {
  display: flex;
  flex-direction: column;
}

.ds-expand-all {
  line-height: 12px;
}

.container {
  padding: 15px 15px 0px 15px;
  margin: auto;
}

.dashboard {
  max-height: calc(100vh - 150px);
  padding: 15px;
  overflow-y: scroll;
  background-color: white;
}

.v-tab--active {
  border: 2px solid black;
  border-bottom: 2px solid white;
}

.dashboard /deep/ .v-slide-group__content.v-tabs-bar__content::before {
  position: absolute;
  content: '';
  width: 100%;
  height: 100%;
  top: 0px;
  border-bottom: 2px solid black;
}

.content {
  padding-top: 20px;
  border: 2px solid black;
  border-top: none;
}

.content-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.time-range,
.version {
  display: flex;
  width: 480px;
  align-items: baseline;
  margin-left: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
}

.version .version-list {
  display: inline-block;
  width: 50%;
}
.version .version-bar {
  display: inline-block;
  margin: 0 20px;
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
  padding: 24px;
}

.sub-scale .chart-card {
  padding: 24px 0px;
}

.activity-header {
  margin: 24px 0;
}

.v-expansion-panel-header {
  flex-direction: row-reverse;
}
</style>

<script>
import _ from "lodash";
import api from "../Components/Utils/api/api.vue";
import Applet from "../models/Applet";
import Activity from "../models/Activity";
import Item from "../models/Item";
import TokenChart from "../Components/DataViewerComponents/TokenChart.vue";
import ActivitySummary from "../Components/DataViewerComponents/ActivitySummary.vue";
import RadioSlider from "../Components/DataViewerComponents/RadioSlider.vue";
import SubScaleLineChart from "../Components/DataViewerComponents/SubScaleLineChart";
import SubScaleBarChart from "../Components/DataViewerComponents/SubScaleBarChart";

import * as moment from 'moment';

export default {
  name: "ReviewerDashboard",

  /**
   * Components that this component depends on.
   */
  components: {
    TokenChart,
    ActivitySummary,
    RadioSlider,
    SubScaleLineChart,
    SubScaleBarChart,
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
      allExpanded: false,
      responses: [],
      selectedTab: 0,
      panel: [],
      tabs: ['responses', 'tokens'],
      focusExtent: [ONE_WEEK_AGO, TODAY],
      selectedVersions: [],
      hasVersionBars: true,
      panelWidth: 974,
      margin: 50,
      itemPadding: 15
    }
  },

  /**
   * Computed properties.
   */
  computed: {
    appletVersions() {
      const versions = this.applet.versions.map(version => version.version)
      return [...new Set(versions)];
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
      this.status = this.$i18n.t('loadingAppletData');
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

      this.onResize = this.onResize.bind(this);
      this.$nextTick(this.onResize);
      window.addEventListener('resize', this.onResize);
    } catch (error) {
      this.status = "Oops, something went wrong. We couldn't load the applet";
      this.error = error;
      console.error(error);
    }
  },

  destroyed() {
    window.removeEventListener('resize', this.onResize);
  },

  /**
   * Component methods.
   */
  methods: {
    onResize() {
      const dimensions = this.$refs.panels.getBoundingClientRect();
      this.panelWidth = dimensions.width - this.margin;
    },
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
      let NOW = new Date();
      NOW.setDate(NOW.getDate() + 1);
      return (
        (moment.utc(date) > this.focusExtent[0]) && 
        (moment.utc(date) <= moment.utc(NOW))
      );
    },

    /**
     * Expand all activities.
     *
     * @param {void}
     * @return {void}
     */

    onAllExpand() {
      this.$set(this.applet, 'selectedActivites', this.applet.activities.map((k, i) => i));
      this.allExpanded = true;
    },

    /**
     * Collapse all activities.
     *
     * @param {void}
     * @return {void}
     */

    onAllCollapsed () {
      this.$set(this.applet, 'selectedActivites', [])
      this.allExpanded = false;
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
    },
  },
};
</script>
