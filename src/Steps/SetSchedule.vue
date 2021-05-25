<template>
  <div class="schedule">
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
          {{ $t("savingSchedule") }}
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
          {{ $t("waitSeveralMinutes") }}
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
            {{ $t("close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <template>
      <div class="tools">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              class="ms-4"
              @click="clearSchedule"
              v-on="on"
            >
              {{ $t("clear") }}
            </v-btn>
          </template>
          <span>{{ $t("clearActivities") }}</span>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              class="ms-4"
              @click="saveSchedule"
              v-on="on"
            >
              {{ $t("save") }}
            </v-btn>
          </template>
          <span>{{ $t("saveActivities") }}</span>
        </v-tooltip>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tools {
  position: fixed;
  bottom: 16px;
  text-align: right;
  right: 32px;
}

.schedule {
  padding: 10px;
  background-color: white;
}
</style>

<script>
import _ from "lodash";
import Calendar from "../Components/CalendarComponents/CalendarMain";
import api from "../Components/Utils/api/api.vue";
import { AppletMixin } from '@/Components/Utils/mixins/AppletMixin';
import { addActivityColor } from "@/Components/CalendarComponents/activityColorPalette.js";
export default {
  name: "Schedule",
  components: {
    Calendar,
  },
  mixins: [AppletMixin],
  data: () => ({
    /**
     * colors for the activities, to show on the left hand bar
     */
    dialog: false,
    loading: true,
    saveSuccess: false,
    saveError: false,
    errorMessage: "",

  }),
  computed: {
    /**
     * format the activities in a way that's needed to render the calendar
     */
    activities() {
      if (this.currentAppletData) {
        const activityTypeColorMap = {}
        let index = 0;
        const activities = _.pickBy(this.currentAppletData.activities, (a) => (
          !(_.get(a, ["reprolib:terms/isPrize", 0, "@value"], false))
        ));
        return _.map(activities, (a, URI) => {
          const name =
            a["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
          const color = this.$dayspan.colors[index % this.$dayspan.colors.length].text;
          index += 1;

          addActivityColor(a._id, color); // add the activity color
          return {
            name,
            color,
            visibility: 1,
            URI,
            id:a._id
          };
        });
      }
      return [];
    },
    /**
     * if there is a selected applet, grab its schedule from the store
     */
    schedule() {
      if (this.currentAppletData) {
        if (this.$store.state.currentAppletData.applet.schedule) {
          return this.$store.state.currentAppletData.applet.schedule;
        }
      }
      return {};
    },
  },
  watch: {
    $route(to, from) {
      // If user modifies url during session, redirect to applets screen
      this.$router.push("/dashboard").catch(err => {});
    },
  },
  mounted() {
    let process;
    if (!this.isLatestApplet(this.currentAppletMeta)) {
      process = this.loadApplet(this.currentAppletMeta.id).then(data => data.schedule);
    } else {
      process = api.getSchedule({
        apiHost: this.apiHost,
        token: this.token,
        id: this.currentAppletMeta.id,
      }).then(resp => resp.data);
    }

    process.then(schedule => {
      this.updateCachedSchedule(schedule);
      this.loading = false;

      this.$refs.calendar.loadState();
      this.$refs.calendar.$refs.app.setDefaultType();
      this.$refs.calendar.$refs.app.setToday();
    })
  },
  methods: {
    saveSchedule() {
      this.$refs.calendar.$refs.app.$refs.calendar.clearPlaceholder();

      const scheduleForm = new FormData();
      if (
        this.currentAppletData &&
        this.currentAppletData.applet &&
        this.currentAppletData.applet.schedule
      ) {
        this.dialog = true;
        this.saveSuccess = false;
        this.saveError = false;
        this.loading = true;

        const schedule = this.addEventType(this.currentAppletData.applet.schedule);
        const removedEvents = this.$store.state.removedEvents;

        scheduleForm.set("schedule", JSON.stringify(schedule || {}));
        scheduleForm.set("deleted", JSON.stringify(removedEvents || {}));
        api
          .setSchedule({
            apiHost: this.$store.state.backend,
            id: this.currentAppletMeta.id,
            token: this.$store.state.auth.authToken.token,
            data: scheduleForm,
          })
          .then((response) => {
            this.updateCachedSchedule(response.data);
          })
          .catch((e) => {
            this.errorMessage = `Save Unsuccessful. ${e}`;
            this.loading = false;
            this.saveError = true;
          });
      }
    },

    updateCachedSchedule(schedule) {
      const applet = this.currentAppletData.applet;
      applet.schedule = schedule;
      this.$store.commit("setApplet", applet);
      this.$store.commit("resetUpdatedEventId");
      const events = _.filter(schedule.events, (event) => (
        _.filter(this.activities, (act => act.URI == event.data.activity_id)).length > 0
      ));
      this.$store.commit(
        "setCachedEvents",
        events
      );
      this.loading = false;
      this.saveSuccess = true;
    },

    async clearSchedule() {
      const res = await this.$dialog.warning({
        title: "Alert",
        color: "#1976d2",
        text: this.$t('confirmRemoveAllEvents'),
        persistent: false,
        actions: {
          No: this.$t('no'),
          Yes: {
            color: "#1976d2",
            text: this.$t('yes'),
          },
        },
      });

      if (res === "Yes") {
        const schedule = this.currentAppletData.applet.schedule;
        const userIds = Object.keys(this.$store.state.currentUsers);
        const events = [];

        for (let event of schedule.events) {
          if (event["id"]) {
            if (this.arraysEqual(event.data.users, userIds)) {
              this.$store.commit("addRemovedEventId", event["id"]);
            } else {
              events.push(event);
            }
          }
        }
        schedule.events = events;

        this.$store.commit("setSchedule", schedule);
        this.$store.commit("setCachedEvents", schedule.events);

        this.$refs.calendar.$refs.app.clearEvents();
      }
    },
    addEventType(schedule) {
      const appletSchedule = schedule;
      appletSchedule.events.forEach((event, index) => {
        for (const activityId in this.$store.state.currentAppletData.activities) {
          const activity = this.$store.state.currentAppletData.activities[
            activityId
          ];
          if (
            event.data.URI === activity["@id"] ||
            event.data.URI === activity["url"] ||
            event.data.URI === activity["_id"].split("/")[1]
          ) {
            appletSchedule.events[index].data.activity_id = activity[
              "_id"
            ].split("/")[1];
          }
        }
        if (Object.keys(event.schedule).includes("dayOfWeek")) {
          appletSchedule.events[index].data.eventType = "Weekly";
        } else if (Object.keys(event.schedule).includes("year")) {
          appletSchedule.events[index].data.eventType = "";
        } else if (Object.keys(event.schedule).includes("dayOfMonth")) {
          appletSchedule.events[index].data.eventType = "Monthly";
        } else {
          appletSchedule.events[index].data.eventType = "Daily";
        }
      });
      return appletSchedule;
    },

    // Utilities

    arraysEqual(a, b) {
      if (!a && !b.length) return true;
      if (!a && b.length) return false;
      if (a.length !== b.length) return false;

      // If you don't care about the order of the elements inside
      // the array, you should sort both arrays here.
      // Please note that calling sort on an array will modify that array.
      // you might want to clone your array first.

      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
  },
};
</script>
