<template>
  <v-dialog
    v-model="open"
    v-bind="dialogProps"
    :fullscreen="$dayspan.fullscreenDialogs"
  >
    <div v-if="schedule && details">
      <!-- <v-card-text> -->
      <event
        v-bind="{ $scopedSlots }"
        :target-details="details"
        :target-schedule="schedule"
        :calendar="calendar"
        :calendar-event="calendarEvent"
        :day="day"
        :activities="activities"
        :read-only="readOnly"
        @saved="saved"
        @cancel="cancel"
        @actioned="actioned"
        @event-create="eventCreate"
        @event-update="eventUpdate"
        @event-remove="eventRemove"
      >
        <template name="eventDetailsLocation">
          Notifications
        </template>
      </event>
      <!-- </v-card-text> -->
    </div>
  </v-dialog>
</template>

<script>
import { Calendar, Schedule, Functions as fn } from "dayspan";
import Event from "./Event";

export default {
  name: "dsEventDialog",

  components: {
    Event,
  },

  props: {
    activities: {
      type: Array,
      required: true,
    },
    calendar: {
      type: Calendar,
    },

    dialogProps: {
      validate(x) {
        return this.$dsValidate(x, "dialogProps");
      },
      default() {
        return this.$dsDefaults().dialogProps;
      },
    },

    readOnly: {
      type: Boolean,
      default: false,
    },
  },

  // eslint-disable-next-line
  data: (vm) => ({
    open: false,
    calendarEvent: null,
    details: null,
    schedule: null,
    day: null,
  }),

  computed: {},

  methods: {
    addToday() {
      this.add(this.$dayspan.today);
    },

    add(day, days) {
      this.addSchedule(day, Schedule.forDay(day, days));
    },

    addAt(day, hour) {
      this.addSchedule(day, Schedule.forTime(day, hour));
    },

    addSpan(span) {
      this.addSchedule(span.start, Schedule.forSpan(span));
    },

    addPlaceholder(placeholder, details) {
      this.addSchedule(
        placeholder.start,
        placeholder.schedule,
        details || placeholder.event.data
      );
    },

    addSchedule(day, schedule, details) {
      this.day = day;
      this.calendarEvent = null;
      this.details = details || this.$dayspan.getDefaultEventDetails();
      this.schedule = schedule;

      this.finishOpen();
    },

    edit(calendarEvent) {
      this.day = calendarEvent.start;
      this.calendarEvent = calendarEvent;
      this.details =
        calendarEvent.event.data || this.$dayspan.getDefaultEventDetails();
      this.schedule = calendarEvent.schedule;

      this.finishOpen();
    },

    finishOpen() {
      var ev = this.getEvent("open");

      this.$emit("open", ev);

      if (ev.open) {
        this.open = true;
      }
    },

    eventCreate(ev) {
      this.$emit("event-create", ev);
    },

    eventUpdate(ev) {
      this.$emit("event-update", ev);
    },

    eventRemove(ev) {
      this.$emit("event-remove", ev);
    },

    actioned(ev) {
      ev.hide = true;
      this.$emit("actioned", ev);
      this.finishClose(ev);
    },

    cancel(ev) {
      ev.hide = true;
      this.$emit("cancel", ev);
      this.finishClose(ev);
    },

    saved(ev) {
      ev.hide = true;
      this.$emit("saved", ev);
      this.finishClose(ev);
    },

    finishClose(ev) {
      if (ev.hide) {
        this.open = false;
        this.$emit("close", ev);
      }

      this.schedule = null;
      this.details = null;
    },

    getEvent(type, extra = {}) {
      return fn.extend(
        {
          type: type,
          day: this.day,
          schedule: this.schedule,
          calendar: this.calendar,
          calendarEvent: this.calendarEvent,
          handled: false,
          open: true,
          $vm: this,
          $element: this.$el,
        },
        extra
      );
    },
  },
};
</script>

<style lang="scss"></style>
