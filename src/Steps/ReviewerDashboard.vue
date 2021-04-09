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
                  class="date-range-picker"
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
                  class="date-range-picker"
                />
              </v-menu>
            </div>

            <div id="versions" class="version">
              <v-select
                v-model="selectedVersions"
                attach="#versions"
                class="version-list"
                :menu-props="{ maxHeight: 232}"
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
                      <v-expansion-panel-content
                        v-if="applet.hasTokenItem"
                      >
                        <token-chart
                          :plot-id="`Token-${applet.id}`"
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
                      <v-expansion-panel-content
                        v-else
                      >
                        <h4>
                          {{ $t("noTokenDataAvailable") }}
                        </h4>
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
                          :time-range="timeRange"
                          :item-padding="itemPadding"
                        />
                      </v-expansion-panel-header>
                      <v-expansion-panel-content
                        v-if="activity.responses && activity.responses.length && (tab !== 'tokens' || activity.hasTokenItem)"
                      >
                        <div
                          v-if="activity.finalSubScale && activity.finalSubScale.latest.outputText"
                          class="additional-note mt-4"
                        >
                          <header>
                            <h2> - Additional Information </h2>
                          </header>
                          <div
                            class="subscale-output"
                          >
                            <mavon-editor
                              :value="activity.finalSubScale.latest.outputText"
                              :language="'en'"
                              :toolbarsFlag="false"
                            >
                            </mavon-editor>
                          </div>
                        </div>

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
                              v-if="applet && !subScale.isFinalSubScale"
                              :key="subScale.variableName"
                            >
                              <v-expansion-panel-header>
                                <h4>
                                  {{ subScale.variableName }}
                                  ( {{ $t('latestScore') }}: {{ subScale.latest.tScore }} )
                                </h4>
                              </v-expansion-panel-header>

                              <v-expansion-panel-content>
                                <div>
                                  <div
                                    v-if="subScale.latest.outputText"
                                    class="additional-note"
                                  >
                                    <header>
                                      <h3> - Additional Information </h3>
                                    </header>
                                    <div
                                      class="subscale-output"
                                    >
                                      <mavon-editor
                                        :value="subScale.latest.outputText"
                                        :language="'en'"
                                        :toolbarsFlag="false"
                                      >
                                      </mavon-editor>
                                    </div>
                                  </div>
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
                                        :time-range="timeRange"
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
                            <header
                            >
                              <h3
                                v-if="item.inputType !== 'markdownMessage'"
                              >
                                - {{ item.getFormattedQuestion() }}
                              </h3>

                              <h3
                                v-else
                              >
                                - {{ item.label.en }}
                              </h3>
                            </header>
                            <div
                              v-if="item.inputType == 'markdownMessage'"
                            >
                              <div
                                class="markdown"
                              >
                                <mavon-editor
                                  :value="item.question.en"
                                  :language="'en'"
                                  :toolbarsFlag="false"
                                >
                                </mavon-editor>
                              </div>
                            </div>

                            <TimePicker
                              v-if="tab == 'responses' && item.inputType === 'time'"
                              :plot-id="`RadioSlider-${activity.slug}-${item.slug}`"
                              :item="item"
                              :versions="applet.versions"
                              :focus-extent="focusExtent"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :has-version-bars="hasVersionBars"
                              :parent-width="panelWidth"
                              :color="item.dataColor"
                              :time-range="timeRange"
                              :maxValue="getMaxValue(activity.items)"
                              :minValue="getMinValue(activity.items)"
                            />
                            <RadioSlider
                              v-else-if="tab == 'responses' && item.responseOptions && applet.selectedActivites.includes(index)"
                              :plot-id="`RadioSlider-${activity.slug}-${item.slug}`"
                              :item="item"
                              :versions="applet.versions"
                              :focus-extent="focusExtent"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :has-version-bars="hasVersionBars"
                              :parent-width="panelWidth"
                              :time-range="timeRange"
                              :color="item.dataColor"
                            />

                            <Frequency
                              v-else-if="tab == 'frequency' && item.inputType === 'radio'"
                              :plot-id="`RadioSlider-${activity.slug}-${item.slug}`"
                              :item="item"
                              :versions="applet.versions"
                              :focus-extent="focusExtent"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :has-version-bars="hasVersionBars"
                              :parent-width="panelWidth"
                              :time-range="timeRange"
                              :color="item.dataColor"
                            />

                            <FreeTextTable
                              v-if="tab == 'responses' && item.inputType === 'text'"
                              :plot-id="`FreeText-${activity.data['_id']}-${item.data['_id']}`"
                              :item="item"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :responses="applet.responses[item.schemas[0]]"
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
  position: relative;
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

.v-card:not(.date-range-picker) {
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

.additional-note /deep/ .v-note-edit, .markdown /deep/ .v-note-edit {
  display: none;
}
.additional-note /deep/ .v-note-show, .markdown /deep/ .v-note-show {
  width: 100% !important;
  flex: 0 0 100% !important;
}

.additional-note .subscale-output, .markdown {
  max-height: 150px;
  overflow-y: auto;
  margin: 10px 0px;
}

.additional-note .subscale-output .v-note-wrapper, .markdown .v-note-wrapper{
  min-height: unset;
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
import Frequency from "../Components/DataViewerComponents/Frequency.vue";
import TimePicker from "../Components/DataViewerComponents/TimePicker.vue";
import FreeTextTable from "../Components/DataViewerComponents/FreeTextTable.vue";
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
    Frequency,
    TimePicker,
    FreeTextTable,
    SubScaleLineChart,
    SubScaleBarChart,
  },

  /**
   * Component state.
   */
  data: function() {
    const NOW = new Date();
    const TODAY = NOW;
    TODAY.setDate(TODAY.getDate() + 1);

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
      tabs: ['responses', 'tokens', 'frequency'],
      focusExtent: [ONE_WEEK_AGO, TODAY],
      selectedVersions: [],
      timeRange: "Default",
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
      if (this.$refs.panels) {
        const dimensions = this.$refs.panels.getBoundingClientRect();
        this.panelWidth = dimensions.width - this.margin;
      }
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
     * @param {items} items Activity Items
     * @return {maxValue} Maximum response value
     */

    getMaxValue (items) {
      let maxValue = {
        hour: 0,
        minute: 0,
      };

      items.forEach(item => {
        if (item.inputType === 'time') {
          item.responses.forEach(({ value }) => {
            if (value.hour > maxValue.hour) {
              maxValue.hour = value.hour;
            }
          });
        }
      });

      maxValue.hour += 1;
      return maxValue;
    },

    /**
     * Expand all activities.
     *
     * @param {items} items Activity Items
     * @return {minValue} Minimum response value
     */

    getMinValue (items) {
      let minValue = {
        hour: 23,
        minute: 0,
      };

      items.forEach(item => {
        if (item.inputType === 'time') {
          item.responses.forEach(({ value }) => {
            if (value.hour < minValue.hour) {
              minValue.hour = value.hour;
            }
          });
        }
      });

      return minValue;
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
      this.updateTimeRange();
    },
    /**
     * Updates the end date for the focused time range.
     *
     * @param {string} date the new end date.
     * @returns {void}
     */
    setEndDate(date) {
      this.$set(this.focusExtent, 1, moment.utc(date).add(15, 'hours').toDate());
      this.updateTimeRange();
    },

    updateTimeRange() {
      if (moment(this.focusExtent[1]).diff(moment(this.focusExtent[0]), 'days', true) < 15) {
        this.timeRange = "Default";
      } else if (moment(this.focusExtent[1]).diff(moment(this.focusExtent[0]), 'months', true) <= 1) {
        this.timeRange = "Daily";
      } else if (moment(this.focusExtent[1]).diff(moment(this.focusExtent[0]), 'months', true) <= 4) {
        this.timeRange = "Weekly";
      } else {
        this.timeRange = "Monthly";
      }
    },

    onUpdateFocusExtent(focusExtent) {
      this.$set(this, 'focusExtent', focusExtent);
    },
  },
};
</script>
