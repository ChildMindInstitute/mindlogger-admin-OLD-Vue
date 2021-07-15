<template>
  <v-expansion-panel class="sub-scale">
    <v-expansion-panel-header>
      <h4>
        {{ subScale.variableName }}
        ( {{ $t("score") }}: {{ tScore }} )
      </h4>
    </v-expansion-panel-header>

    <v-expansion-panel-content>
      <div>
        <div
          v-if="subScale.current.outputText"
          class="additional-note"
        >
          <header>
            <h3>- Additional Information</h3>
          </header>
          <div class="subscale-output">
            <mavon-editor
              :value="subScale.current.outputText"
              :language="'en'"
              :toolbarsFlag="false"
            ></mavon-editor>
          </div>
        </div>
        <template
          v-for="item in subScale.items"
        >
          <div :key="item['id']" class="chart-card">
            <header>
            <h3 v-if="item.inputType !== 'markdownMessage'">
              <vue-markdown class="item-question">
                {{ item.getFormattedQuestion() }}
              </vue-markdown>
            </h3>

            <h3 v-else>- {{ item.label.en }}</h3>
            </header>

            <RadioSlider
              v-if="
                tab == 'responses' &&
                item.responseOptions &&
                applet.selectedActivites.includes(
                  index
                )
              "
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

        <template
          v-for="innerSubScale in subScale.subScales"
        >
          <v-card
            :key="innerSubScale.variableName"
            class="my-2"
          >
            <SubScaleComponent
              :applet="applet"
              :activity="activity"
              :subScale="innerSubScale"
              :tab="tab"
              :index="index"
              :focusExtent="focusExtent"
              :selectedVersions="selectedVersions"
              :hasVersionBars="hasVersionBars"
              :timeRange="timeRange"
              :panelWidth="panelWidth - 24"
            />
          </v-card>
        </template>
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<style scoped>
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

  .sub-scale .chart-card {
    padding: 24px 0px;
  }
</style>

<script>
import VueMarkdown from "vue-markdown";
import RadioSlider from "./RadioSlider.vue";

export default {
  name: 'SubScaleComponent',

  components: {
    RadioSlider,
    VueMarkdown,
  },

  props: {
    applet: {
      type: Object,
      required: true
    },
    activity: {
      type: Object,
      required: true
    },
    subScale: {
      type: Object,
      required: true
    },
    tab: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    focusExtent: {
      type: Array,
      required: true
    },
    selectedVersions: {
      type: Array,
      required: true
    },
    hasVersionBars: {
      type: Boolean,
      required: true
    },
    timeRange: {
      type: String,
      required: true
    },
    panelWidth: {
      type: Number,
      required: true
    },
  },
  computed: {
    tScore() {
      return this.subScale.current.tScore && Number(Number(this.subScale.current.tScore).toFixed(3))
    }
  }
}
</script>
