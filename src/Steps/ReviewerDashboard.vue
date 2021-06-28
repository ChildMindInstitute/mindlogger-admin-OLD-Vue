<template>
  <div class="container">
    <v-card class="dashboard">
      <div v-if="loading" class="status-message">
        {{ status }}
      </div>

      <div v-else>
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
              <v-tab :key="tab">
                {{ $t(tab) }}
              </v-tab>
            </template>
          </v-tabs>
        </div>

        <div class="content">
          <div v-if="this.tabs[selectedTab] != 'review'" class="content-header">
            <div class="time-range">
              <div class="start-time-range">
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
                    class="date-picker"
                  />
                </v-menu>
                <v-dialog
                  ref="dialog1"
                  v-model="startTimeDialog"
                  :return-value.sync="startTime"
                  persistent
                  width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="startTime"
                      label="Start time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-if="startTimeDialog"
                    v-model="startTime"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="startTimeDialog = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.dialog1.save(startTime); setStartTime()"
                    >
                      OK
                    </v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
              <div class="mx-4">{{ $t("to") }}</div>
              <div class="end-time-range">
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
                    class="date-picker"
                  />
                </v-menu>
                <v-dialog
                  ref="dialog2"
                  v-model="endTimeDialog"
                  :return-value.sync="endTime"
                  persistent
                  width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="endTime"
                      label="End time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-if="endTimeDialog"
                    v-model="endTime"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="endTimeDialog = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.dialog2.save(endTime); setEndTime()"
                    >
                      OK
                    </v-btn>
                  </v-time-picker>
                </v-dialog>
              </div>
            </div>
            <div id="versions" class="version ml-6 mt-2">
              <v-select
                v-model="selectedVersions"
                attach="#versions"
                class="version-list"
                :menu-props="{ maxHeight: 232 }"
                :items="appletVersions"
                :label="$t('versions')"
                multiple
              />
            </div>
          </div>
          <div v-else class="review-header mb-2">
            <v-menu>
              <template v-slot:activator="{ on }">
                Select Date to review:
                <v-btn
                  depressed
                  class="ds-button-tall mr-2 ml-2 mb-2"
                  v-on="on"
                >
                  {{ reviewingDate }}
                </v-btn>
              </template>

              <v-date-picker
                :locale="$i18n.locale.slice(0, 2)"
                no-title
                :allowedDates="responseExists"
                @change="setReviewDate"
                class="date-picker"
              />
            </v-menu>

            <v-btn
              depressed
              class="ds-button-tall mr-2 ml-2 mb-2"
              @click="responseDialog = true"
            >
              {{ reviewingTime }}
            </v-btn>
          </div>

          <div ref="panels">
            <v-tabs-items v-model="selectedTab">
              <v-tab-item v-for="tab in tabs" :key="tab">
                <v-card class="mb-0">
                  <v-expansion-panels
                    v-model="applet.selectedActivites"
                    multiple
                    focusable
                  >
                    <v-expansion-panel v-if="tab == 'tokens'">
                      <v-expansion-panel-header>
                        <div>
                          {{ applet.label.en }}
                        </div>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content v-if="applet.hasTokenItem">
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
                      <v-expansion-panel-content v-else>
                        <h4>
                          {{ $t("noTokenDataAvailable") }}
                        </h4>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel
                      v-else-if="tab != 'review'"
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
                          v-if="allExpanded && applet.activities.length > 1"
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
                          @selectResponse="
                            selectResponse({ activity, ...$event })
                          "
                          @showSubScale="
                            showSubScale({ activity, ...$event })
                          "
                        />
                      </v-expansion-panel-header>
                      <v-expansion-panel-content
                        v-if="
                          activity.responses &&
                          activity.responses.length &&
                          (tab !== 'tokens' || activity.hasTokenItem)
                        "
                      >
                        <div
                          v-if="
                            activity.finalSubScale &&
                            activity.finalSubScale.current.outputText
                          "
                          class="additional-note mt-4"
                        >
                          <header>
                            <h2>- Additional Information</h2>
                          </header>
                          <div class="subscale-output">
                            <mavon-editor
                              :value="activity.finalSubScale.current.outputText"
                              :language="'en'"
                              :toolbarsFlag="false"
                            >
                            </mavon-editor>
                          </div>
                        </div>

                        <h2 class="mt-4">
                          {{ $t("responseOptions") }}
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
                          class="mt-4"
                          focusable
                          multiple
                        >
                          <template v-for="subScale in activity.subScales">
                            <SubScaleComponent
                              v-if="applet && !subScale.isFinalSubScale && !subScale.partOfSubScale"
                              :key="subScale.variableName"
                              :applet="applet"
                              :activity="activity"
                              :subScale="subScale"
                              :tab="tab"
                              :index="index"
                              :focusExtent="focusExtent"
                              :selectedVersions="selectedVersions"
                              :hasVersionBars="hasVersionBars"
                              :timeRange="timeRange"
                              :panelWidth="panelWidth"
                            />
                          </template>
                        </v-expansion-panels>

                        <template v-for="item in activity.items">
                          <div
                            v-if="
                              item.allowEdit &&
                              (tab == 'tokens' || !item.partOfSubScale) &&
                              (tab != 'tokens' || item.isTokenItem)
                            "
                            :key="item['id']"
                            class="chart-card"
                          >
                            <header>
                              <h3 v-if="item.inputType !== 'markdownMessage'">
                                <vue-markdown class="item-question">
                                  {{ item.getFormattedQuestion() }}
                                </vue-markdown>
                              </h3>

                              <h3 v-else>- {{ item.label.en }}</h3>
                            </header>
                            <div v-if="item.inputType == 'markdownMessage'">
                              <div class="markdown">
                                <mavon-editor
                                  :value="item.question.en"
                                  :language="'en'"
                                  :toolbarsFlag="false"
                                >
                                </mavon-editor>
                              </div>
                            </div>

                            <TimePicker
                              v-if="
                                tab == 'responses' && item.inputType === 'time'
                              "
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
                              v-else-if="
                                tab == 'responses' &&
                                item.responseOptions &&
                                applet.selectedActivites.includes(index)
                              "
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
                              v-else-if="
                                tab == 'frequency' && item.inputType === 'radio'
                              "
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
                              v-if="
                                tab == 'responses' && item.inputType === 'text'
                              "
                              :plot-id="`FreeText-${activity.data['_id']}-${item.data['_id']}`"
                              :item="item"
                              :selected-versions="selectedVersions"
                              :timezone="applet.timezoneStr"
                              :responses="applet.responses[item.schemas[0]]"
                            />
                          </div>
                        </template>
                      </v-expansion-panel-content>
                      <v-expansion-panel-content v-else>
                        <h4 v-if="tab != 'tokens'" class="ma-4">
                          {{ $t("noDataAvailable") }}
                        </h4>
                        <h4 v-else>
                          {{ $t("noTokenDataAvailable") }}
                        </h4>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panels v-else class="reviewing-section">
                      <v-card class="reviewing-item">
                        <Responses
                          :key="`response-${reviewing.key}`"
                          :activity="reviewing.activity"
                          :response-id="reviewing.responseId"
                        />
                      </v-card>

                      <v-card class="reviewing-item">
                        <v-tabs
                          v-model="selectedReviewTab"
                          hide-slider
                          light
                          left
                        >
                          <template v-for="reviewingTab in reviewingTabs">
                            <v-tab :key="reviewingTab">
                              {{ $t(reviewingTab) }}
                            </v-tab>
                          </template>
                        </v-tabs>

                        <v-tabs-items v-model="selectedReviewTab">
                          <v-tab-item
                            v-for="reviewingTab in reviewingTabs"
                            :key="reviewingTab"
                            class="mx-2"
                          >
                            <div v-if="reviewingTab == 'notes'">
                              <Notes
                                :key="`note-${reviewing.key}`"
                                :response-id="reviewing.responseId"
                              />
                            </div>
                            <div v-else>
                              {{ $t(reviewingTab) }}
                            </div>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-card>
                    </v-expansion-panels>
                  </v-expansion-panels>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </div>
        </div>
      </div>

      <ResponseSelectionDialog
        v-model="responseDialog"
        :applet="applet"
        :date="reviewing.date"
        :current-response="reviewing.responseId"
        @selectResponse="selectResponse"
      />
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

.tabs .v-tab--active {
  border: 2px solid black;
  border-bottom: 2px solid white;
}

.dashboard .tabs /deep/ .v-slide-group__content.v-tabs-bar__content::before {
  position: absolute;
  content: "";
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

.review-header {
  display: flex;
  margin: 0px 20px;
  align-items: center;
}

.time-range,
.version {
  position: relative;
  display: flex;
  align-items: baseline;
  margin-left: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
}

.toDate,
.fromDate {
  width: 100%;
  margin: 0 !important;
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
  color: #1976d2;
}

.wrapper {
  width: 90%;
  margin: 1rem auto;
}

.v-card:not(.date-picker) {
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

.activity-header {
  margin: 24px 0;
}

.v-expansion-panel-header {
  flex-direction: row-reverse;
}

.additional-note /deep/ .v-note-edit,
.markdown /deep/ .v-note-edit {
  display: none;
}
.additional-note /deep/ .v-note-show,
.markdown /deep/ .v-note-show {
  width: 100% !important;
  flex: 0 0 100% !important;
}

.additional-note .subscale-output,
.markdown {
  max-height: 150px;
  overflow-y: auto;
  margin: 10px 0px;
}

.additional-note .subscale-output .v-note-wrapper,
.markdown .v-note-wrapper {
  min-height: unset;
}

.reviewing-item {
  width: 50%;
  overflow-y: scroll;
  height: 95%;
}

.reviewing-section {
  max-height: calc(80vh - 200px);
  padding: 0px 20px;
}
</style>
<style>
.item-question img {
  width: 250px;
}
</style>

<script>
import _ from "lodash";
import VueMarkdown from "vue-markdown";
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
import ResponseSelectionDialog from "../Components/Utils/dialogs/ResponseSelectionDialog";
import Responses from "../Components/DataViewerComponents/Responses";
import Notes from "../Components/DataViewerComponents/Notes";
import SubScaleComponent from "../Components/DataViewerComponents/SubScaleComponent";

import * as moment from "moment-timezone";

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
    VueMarkdown,
    ResponseSelectionDialog,
    Responses,
    Notes,
    SubScaleComponent,
  },

  /**
   * Component state.
   */
  data: function () {
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
      selectedReviewTab: 1,
      panel: [],
      tabs: ["responses", "tokens"],
      reviewingTabs: ["assessment", "notes", "reviewed"],
      focusExtent: [ONE_WEEK_AGO, TODAY],
      selectedVersions: [],
      timeRange: "Default",
      startTimeDialog: false,
      startTime: null,
      endTimeDialog: false,
      endTime: null,
      hasVersionBars: true,
      panelWidth: 974,
      margin: 50,
      itemPadding: 15,
      reviewing: {
        date: "",
        activity: {},
        responseId: "",
        key: 0,
      },
      responseDialog: false,
      cachedContents: {}
    };
  },

  /**
   * Computed properties.
   */
  computed: {
    appletVersions() {
      const versions = this.applet.versions.map((version) => version.version);
      return [...new Set(versions)];
    },
    currentApplet() {
      return this.$store.state.currentAppletData;
    },
    fromDate() {
      return moment.utc(this.focusExtent[0]).format("ddd, D MMM YYYY");
    },
    toDate() {
      return moment.utc(this.focusExtent[1]).format("ddd, D MMM YYYY");
    },
    reviewingDate() {
      return (
        this.reviewing.date &&
        moment(new Date(this.reviewing.date)).format("ddd, D MMM YYYY")
      );
    },
    reviewingTime() {
      return (
        this.reviewing.date &&
        moment(new Date(this.reviewing.date)).format("hh:mm:ss A")
      );
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
      this.status = this.$i18n.t("loadingAppletData");
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

      this.setDashboardTabs();
      this.selectedVersions = this.appletVersions;
      this.loading = false;
      this.onResize = this.onResize.bind(this);

      let latestActivity = null,
        latestResponseId = null;

      for (let i = 0; i < this.applet.activities.length; i++) {
        const activity = this.applet.activities[i];
        if (
          activity.lastResponseDate &&
          (!latestActivity ||
            activity.lastResponseDate < latestActivity.lastResponseDate)
        ) {
          latestActivity = activity;

          const latestResponse = activity.responses.find(
            (response) => response.date == activity.lastResponseDate
          );
          latestResponseId = latestResponse && latestResponse.responseId;
        }
      }

      if (latestActivity) {
        this.$set(this, "reviewing", {
          date: latestActivity.lastResponseDate.toString(),
          activity: latestActivity,
          responseId: latestResponseId,
          key: 1,
        });
      }

      this.$nextTick(this.onResize);
      window.addEventListener("resize", this.onResize);
    } catch (error) {
      this.status = "Oops, something went wrong. We couldn't load the applet";
      this.error = error;
      console.error(error);
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  },

  /**
   * Component methods.
   */
  methods: {
    setDashboardTabs() {
      for (const itemId in this.applet.items) {
        if (this.applet.items[itemId].isTokenItem) {
          this.tabs.push("frequency");
          break;
        }
      }

      if (
        this.applet.activities &&
        this.applet.activities.some((activity) => activity.getFrequency() > 0)
      ) {
        this.tabs.push("review");
      }
    },

    setReviewDate(date) {
      this.$set(this, "reviewing", {
        date: moment.tz(date, moment.tz.guess()).format(),
        activity: {},
        responseId: "",
        key: this.reviewing.key + 1,
      });

      this.responseDialog = true;
    },

    selectResponse({ activity, responseId, date }) {
      this.$set(this, "reviewing", {
        date,
        activity,
        responseId,
        key: this.reviewing.key + 1,
      });

      if (this.tabs[this.selectedTab] !== "review") {
        this.selectedTab = this.tabs.indexOf("review");
      }
    },

    async showSubScale({ activity, responseId }) {
      for (let subScale of activity.subScales) {
        const current = subScale.values.find(data => data.value.responseId == responseId);

        if (!current) {
          subScale.current.outputText = '';
          continue;
        }

        if (!this.cachedContents[current.value.outputText]) {
          const outputText = await activity.getOutputText(current.value.outputText);

          this.cachedContents[current.value.outputText] = outputText;
        }

        for (const key in current.value) {
          subScale.current[key] = current.value[key];
        }
        subScale.current.outputText = this.cachedContents[current.value.outputText];
      }
    },

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
    responseExists(date) {
      if (this.applet.availableDates[moment(date).format("L")]) {
        return true;
      }

      return false;
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
      let endDate = moment.utc(date);

      if (this.endTime) {
        const time = moment(this.endTime, "HH:mm");

        endDate.set({
          hour:   time.get('hour'),
          minute: time.get('minute')
        });
      }

      return (
        moment.utc(endDate) >= this.focusExtent[0] &&
        moment.utc(endDate) <= moment.utc(NOW)
      );
    },

    /**
     * Expand all activities.
     *
     * @param {items} items Activity Items
     * @return {maxValue} Maximum response value
     */

    getMaxValue(items) {
      let maxValue = {
        hour: 0,
        minute: 0,
      };

      items.forEach((item) => {
        if (item.inputType === "time") {
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

    getMinValue(items) {
      let minValue = {
        hour: 23,
        minute: 0,
      };

      items.forEach((item) => {
        if (item.inputType === "time") {
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
      this.$set(
        this.applet,
        "selectedActivites",
        this.applet.activities.map((k, i) => i)
      );
      this.allExpanded = true;
    },

    /**
     * Collapse all activities.
     *
     * @param {void}
     * @return {void}
     */

    onAllCollapsed() {
      this.$set(this.applet, "selectedActivites", []);
      this.allExpanded = false;
    },

    setEndTime() {
      this.setEndDate(this.focusExtent[1]);
    },

    setStartTime() {
      this.setStartDate(this.focusExtent[0]);
    },
    /**
     * Updates the start date for the focused time range.
     *
     * @param {string} date the new start date.
     * @returns {void}
     */
    setStartDate(date) {
      let startDate = moment.utc(date);

      if (this.startTime) {
        const time = moment(this.startTime, "HH:mm");

        startDate.set({
          hour:   time.get('hour'),
          minute: time.get('minute')
        });
      }

      this.$set(this.focusExtent, 0, startDate.toDate());
      this.updateTimeRange();
    },
    /**
     * Updates the end date for the focused time range.
     *
     * @param {string} date the new end date.
     * @returns {void}
     */
    setEndDate(date) {
      let endDate = moment.utc(date);

      if (this.endTime) {
        const time = moment(this.endTime, "HH:mm");

        endDate.set({
          hour:   time.get('hour'),
          minute: time.get('minute')
        });
      }

      this.$set(this.focusExtent, 1, endDate.toDate());
      this.updateTimeRange();
    },

    updateTimeRange() {
      if (
        moment(this.focusExtent[1]).diff(
          moment(this.focusExtent[0]),
          "days",
          true
        ) < 15
      ) {
        this.timeRange = "Default";
      } else if (
        moment(this.focusExtent[1]).diff(
          moment(this.focusExtent[0]),
          "months",
          true
        ) <= 1
      ) {
        this.timeRange = "Daily";
      } else if (
        moment(this.focusExtent[1]).diff(
          moment(this.focusExtent[0]),
          "months",
          true
        ) <= 4
      ) {
        this.timeRange = "Weekly";
      } else {
        this.timeRange = "Monthly";
      }
    },

    onUpdateFocusExtent(focusExtent) {
      this.$set(this, "focusExtent", focusExtent);
    },
  },
};
</script>
