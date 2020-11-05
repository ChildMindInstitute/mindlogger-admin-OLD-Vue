<template>
  <v-app v-cloak id="dayspan">
    <calendar-app
      ref="app"
      :events="events"
      :calendar="calendar"
      :read-only="readOnly"
      :activities="activities"
      @change="saveState"
      @saved="loadState"
    >
      <template slot="menuRight" />

      <template slot="eventPopover" slot-scope="slotData">
        <calendar-event-popover v-bind="slotData" :read-only="readOnly" @finish="saveState" />
      </template>

      <template slot="eventCreatePopover" slot-scope="{placeholder, calendar, close}">
        <calendar-event-create-popover
          :calendar-event="placeholder"
          :calendar="calendar"
          :close="$refs.app.$refs.calendar.clearPlaceholder"
          :activities="activities"
          @create-edit="$refs.app.editPlaceholder"
          @create-popover-closed="saveState"
        />
      </template>

      <template slot="eventTimeTitle" slot-scope="{calendarEvent, details}">
        <div>
          <v-icon
            v-if="details.icon"
            class="ds-ev-icon"
            size="14"
            :style="{color: details.forecolor}"
          >{{ details.icon }}</v-icon>
          <strong class="ds-ev-title">{{ details.title }}</strong>
        </div>
        <div class="ds-ev-description">{{ getCalendarTime( calendarEvent ) }}</div>
      </template>

      <template slot="drawerBottom">
        <div class="pa-3">
          <v-subheader>Activities</v-subheader>
          <v-checkbox
            v-for="act in activities"
            :key="act.name"
            v-model="act.visible"
            :label="act.name"
            :color="act.color"
          />
          <!-- <v-checkbox
            label="Read Only?"
            v-model="readOnly"
          ></v-checkbox>-->
        </div>
      </template>
    </calendar-app>
  </v-app>
</template>

<script>
import { Calendar } from "dayspan";
import Vue from "vue";
import _ from "lodash";

import CalendarApp from "./CalendarApp";
import CalendarEventCreatePopover from "./CalendarEventCreatePopover";
import CalendarEventPopover from "./CalendarEventPopover";

export default {
  name: "App",

  components: {
    CalendarApp,
    CalendarEventCreatePopover,
    CalendarEventPopover
  },

  props: {
    activities: {
      type: Array,
      required: true
    },
    events: {
      type: Array
    }
  },

  data: () => ({
    storeKey: "dayspanState",
    calendar: Calendar.months(),
    readOnly: false,
    defaultEvents: []
  }),

  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },

    currentAppletName() {
      if (!_.isEmpty(this.currentApplet)) {
        return this.$store.state.currentApplet.applet["skos:prefLabel"];
      }
    },

    currentSchedule() {
      if (this.currentApplet) {
        return this.$store.state.currentApplet.applet.schedule || null;
      }
    }
  },

  watch: {
    currentAppletName() {
      this.loadState();
    }
  },

  created() {
    const currentLang = this.$store.state.currentLanguage;

    this.$dayspan.setLocale(currentLang);
  },

  mounted() {
    window.app = this.$refs.app;

    this.loadState();
  },

  methods: {
    getCalendarTime(calendarEvent) {
      let sa = calendarEvent.start.format("a");
      let ea = calendarEvent.end.format("a");
      let sh = calendarEvent.start.format("h");
      let eh = calendarEvent.end.format("h");

      if (calendarEvent.start.minute !== 0) {
        sh += calendarEvent.start.format(":mm");
      }

      if (calendarEvent.end.minute !== 0) {
        eh += calendarEvent.end.format(":mm");
      }

      return sa === ea ? sh + " - " + eh + ea : sh + sa + " - " + eh + ea;
    },

    getState() {},

    saveState() {

      const state = this.calendar.toInput(true);
      const storeState = this.$store.state;

      let oldStateEvents = [];
      let newStateEvents = [];
      if (state && storeState) {
        try {
          const currentId = this.$store.state.currentApplet.applet._id;
          oldStateEvents = this.$store.state.cachedEvents;
        } catch {}
        newStateEvents = state.events;
      }

      if (this.currentApplet) {
        if (_.difference(oldStateEvents, newStateEvents)) {
          if (oldStateEvents.length === newStateEvents.length) {
            const events = oldStateEvents.map((event, i) => {
              const ev = newStateEvents[i];
              if (event.id) {
                ev.id = event.id;
              }
              return ev;
            });
            state.events = events;
          } else if(oldStateEvents.length < newStateEvents.length && oldStateEvents.length > 0) {
            let index = 0;
            const events = newStateEvents.map((event) => {
              const ev = event;
              let newEvent = oldStateEvents[index];
              if (!newEvent) {
                return ev;
              }
              if (newEvent.id) {
                const notificationId = newEvent.id;
                delete newEvent["id"];
                if (JSON.stringify(ev) === JSON.stringify(newEvent)) {
                  ev.id = notificationId;
                } else {
                  index -= 1;
                }
              }
              index += 1;
              return ev;
            });
            state.events = events;            
          }
        }
        this.$store.commit("setSchedule", state);
        this.$store.commit("setCachedEvents", state.events);
      }
    },
 
    loadState() {
      let state = {};

      try {
        let savedState = null;
        if (!_.isEmpty(this.currentApplet)) {
          savedState = this.$store.state.currentApplet.applet.schedule || null;
        }

        if (savedState) {
          state = savedState;
          state.preferToday = false;
        }
      } catch (e) {
        // eslint-disable-next-line
        console.log(e);
      }

      if (!state.events || !state.events.length) {
        state.events = this.defaultEvents;
      }

      state.events.forEach(ev => {
        let defaults = this.$dayspan.getDefaultEventDetails();

        ev.data = Vue.util.extend(defaults, ev.data);
      });

      this.$refs.app.setState(state);
    }
  }
};
</script>

<style scoped>
body,
html,
#app,
#dayspan {
  font-family: Roboto, sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--text,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}
</style>
