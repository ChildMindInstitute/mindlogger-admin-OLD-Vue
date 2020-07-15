<template>
  <div>
    <Calendar
      ref="calendar"
      :activities="activities"
    />

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Saving Schedule
        </v-card-title>

        <v-card-text v-if="loading">
          <v-layout
            align-center
            column
          >
            <v-progress-circular
              color="primary"
              indeterminate
            />
          </v-layout>
        </v-card-text>

        <v-card-text v-else-if="saveSuccess">
          Please wait several minutes.
        </v-card-text>

        <v-card-text v-else-if="saveError">
          {{ errorMessage }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      color="primary"
      fixed
      bottom
      left
      @click="$router.go(-1)"
    >
      Back
    </v-btn>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          fixed
          bottom
          right
          @click="saveSchedule"
          v-on="on"
        >
          Save
        </v-btn>
      </template>
      <span>Save all scheduled activities</span>
    </v-tooltip>
  </div>
</template>

<script>
import _ from "lodash";
import Calendar from "../Components/CalendarComponents/CalendarMain";
import api from "../Components/Utils/api/api.vue";

export default {
  name: "Schedule",
  components: {
    Calendar
  },
  data: () => ({
    /**
     * colors for the activities, to show on the left hand bar
     */
    colors: [
      "Orange",
      "Deep Purple",
      "Red",
      "Light Blue",
      "Pink",
      "Glue",
      "Light Green",
      "Blue Gray",
      "Green",
      "Yellow",
      "Teal",
      "Brown",
      "Indigo",
      "Amber",
      "Cyan",
      "Gray",
      "Blue",
      "Purple",
      "Lime",
      "Deep Orange"
    ],
    dialog: false,
    loading: false,
    saveSuccess: false,
    saveError: false,
    errorMessage: ""
  }),
  computed: {
    /**
     * shortcut to current applet in store
     */
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    /**
     * format the activities in a way that's needed to render the calendar
     */
    activities() {
      if (this.currentApplet) {
        let index = 0;
        return _.map(this.currentApplet.activities, (a, URI) => {
          const name =
            a["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
          const color = this.colors[index];
          index += 1;
          return {
            name,
            color,
            visibility: 1,
            URI
          };
        });
      }
      return [];
    },
    /**
     * if there is a selected applet, grab its schedule from the store
     */
    schedule() {
      if (this.currentApplet) {
        if (this.$store.state.currentApplet.applet.schedule) {
          return this.$store.state.currentApplet.applet.schedule;
        }
      }
      return {};
    }
  },
  watch: {
    $route(to, from) {
      // If user modifies url during session, redirect to applets screen
      this.$router.push('/applets');
    },
  },
  mounted() {
    this.$refs.calendar.loadState();
    this.$refs.calendar.$refs.app.setDefaultType();
    this.$refs.calendar.$refs.app.setToday();
  },
  methods: {
    saveSchedule() {
      this.$refs.calendar.$refs.app.$refs.calendar.clearPlaceholder();

      const scheduleForm = new FormData();
      if (
        this.currentApplet &&
        this.currentApplet.applet &&
        this.currentApplet.applet.schedule
      ) {
        this.dialog = true;
        this.saveSuccess = false;
        this.saveError = false;
        this.loading = true;
        const schedule = this.currentApplet.applet.schedule;
        const removedEvents = this.$store.state.removedEvents;
        scheduleForm.set("schedule", JSON.stringify(schedule || {}));
        scheduleForm.set("deleted", JSON.stringify(removedEvents || {}));
        api
          .setSchedule({
            apiHost: this.$store.state.backend,
            id: this.currentApplet.applet._id.split("applet/")[1],
            token: this.$store.state.auth.authToken.token,
            data: scheduleForm
          }) 
          .then(response => {
            const applet = this.currentApplet.applet;
            applet.schedule = response.data.applet.schedule;
            this.$store.commit('setApplet', applet);
            this.$store.commit('resetUpdatedEventId');
            this.$store.commit('setCachedEvents', response.data.applet.schedule.events);
            this.loading = false;
            this.saveSuccess = true;
          })
          .catch(e => {
            this.errorMessage = `Save Unsuccessful. ${e}`;
            this.loading = false;
            this.saveError = true;
          });
      }
    }
  }
};
</script>
