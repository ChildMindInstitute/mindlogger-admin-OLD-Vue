<template>
  <v-app id="dayspan" v-cloak>

    <calendar-app ref="app"
      :calendar="calendar"
      :read-only="readOnly"
      :activities="activities"
      @change="saveState">


      <template slot="menuRight">

      </template>

      <template slot="eventPopover" slot-scope="slotData">
         <calendar-event-popover
          v-bind="slotData"
          :read-only="readOnly"
          @finish="saveState"
        ></calendar-event-popover>
      </template>

      <template slot="eventCreatePopover" slot-scope="{placeholder, calendar, close}">
        <calendar-event-create-popover
          :calendar-event="placeholder"
          :calendar="calendar"
          :close="$refs.app.$refs.calendar.clearPlaceholder"
          :activities="activities"
          @create-edit="$refs.app.editPlaceholder"
          @create-popover-closed="saveState"
        ></calendar-event-create-popover>
      </template>

      <template slot="eventTimeTitle" slot-scope="{calendarEvent, details}">
        <div>
          <v-icon class="ds-ev-icon"
            v-if="details.icon"
            size="14"
            :style="{color: details.forecolor}">
            {{ details.icon }}
          </v-icon>
          <strong class="ds-ev-title">{{ details.title }}</strong>
        </div>
        <div class="ds-ev-description">{{ getCalendarTime( calendarEvent ) }}</div>
      </template>

      <template slot="drawerBottom">
        <div class="pa-3">
          <v-subheader>Activities</v-subheader>
          <v-checkbox v-for="act in activities" :key="act.name" :label="act.name" v-model="act.visible" :color="act.color">

          </v-checkbox>
          <!-- <v-checkbox
            label="Read Only?"
            v-model="readOnly"
          ></v-checkbox> -->
        </div>
      </template>

    </calendar-app>

  </v-app>
</template>

<script>
import { Calendar } from 'dayspan';
import Vue from 'vue';

import CalendarApp from '../Custom/CalendarComponents/CalendarApp';
import CalendarEventCreatePopover from '../Custom/CalendarComponents/CalendarEventCreatePopover';
import CalendarEventPopover from '../Custom/CalendarComponents/CalendarEventPopover';


export default {

  name: 'app',

  components: {
    CalendarApp,
    CalendarEventCreatePopover,
    CalendarEventPopover,
  },

  data: () => ({
    activities: [
      {
        name: 'Morning',
        color: 'blue',
        visible: true,
      },
      {
        name: 'Evening',
        color: 'red',
        visible: true,
      }
    ],
    storeKey: 'dayspanState',
    calendar: Calendar.months(),
    readOnly: false,
    defaultEvents: [],
  }),

  mounted()
  {
    window.app = this.$refs.app;

    // this.loadState();
  },

  methods:
  {
    getCalendarTime(calendarEvent)
    {
      let sa = calendarEvent.start.format('a');
      let ea = calendarEvent.end.format('a');
      let sh = calendarEvent.start.format('h');
      let eh = calendarEvent.end.format('h');

      if (calendarEvent.start.minute !== 0)
      {
        sh += calendarEvent.start.format(':mm');
      }

      if (calendarEvent.end.minute !== 0)
      {
        eh += calendarEvent.end.format(':mm');
      }

      return (sa === ea) ? (sh + ' - ' + eh + ea) : (sh + sa + ' - ' + eh + ea);
    },

    saveState()
    {
      const state = this.calendar.toInput(true);
      // let json = JSON.stringify(state);

      // console.log('state', state);
      // this.$store.commit('setSchedule', { applet: , schedule: state });

      // localStorage.setItem(this.storeKey, json);
    },

    loadState()
    {
      let state = {};

      try
      {
        let savedState = this.$store.state.schedule; // JSON.parse(localStorage.getItem(this.storeKey));

        if (savedState)
        {
          state = savedState;
          state.preferToday = false;
        }
      }
      catch (e)
      {
        // eslint-disable-next-line
        console.log( e );
      }

      if (!state.events || !state.events.length)
      {
        state.events = this.defaultEvents;
      }

      state.events.forEach(ev =>
      {
        let defaults = this.$dayspan.getDefaultEventDetails();

        ev.data = Vue.util.extend( defaults, ev.data );
      });

      this.$refs.app.setState( state );
    }
  }
}
</script>

<style>

body, html, #app, #dayspan {
  font-family: Roboto, sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}

</style>
