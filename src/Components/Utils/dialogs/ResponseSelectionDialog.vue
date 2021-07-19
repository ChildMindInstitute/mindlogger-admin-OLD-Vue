<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card class="pa-2">
      <v-card-title>
        Please Select a Response to Review
      </v-card-title>

      <v-expansion-panels
        v-model="panels"
        multiple
        focusable
      >
        <v-expansion-panel
          v-for="(activity, index) in activities"
          :key="index"
        >
          <v-expansion-panel-header>
            {{ activity.label.en }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mt-2">
              <v-btn
                v-for="response in activity.responses"
                class="ma-2"
                :key="response.time"
                :color="currentResponse == response.responseId ? 'primary' : 'normal'"
                @click="selectResponse(activity, response)"
              >{{ response.time }}</v-btn>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </v-dialog>
</template>

<script>
import * as moment from 'moment-timezone';

export default {
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    date: {
      type: String,
      required: true
    },
    applet: {
      type: Object,
      required: true
    },
    currentResponse: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      panels: []
    };
  },
  computed: {
    activities() {
      const date = moment(new Date(this.date)).format('L');

      return this.applet.activities.map(activity => {
        return ({
          label: activity.label,
          responses: activity.responses.filter(response => date == moment.utc(new Date(response.date)).format('L')).map(response => ({
            time: moment.utc(new Date(response.date)).format('hh:mm:ss A'),
            ...response
          })),
          slug: activity.slug
        })}).filter(activity => activity.responses.length);
    }
  },
  methods: {
    selectResponse(selection, response) {
      this.$emit('selectResponse', {
        activity: this.applet.activities.find(activity => activity.slug == selection.slug),
        responseId: response.responseId,
        date: response.date.toString()
      })
    }
  }
}
</script>
