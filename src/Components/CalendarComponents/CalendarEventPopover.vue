<template>
  <v-card class="ds-calendar-event-popover-card" :class="classes">
    <v-toolbar extended text :style="styleHeader">
      <v-toolbar-title slot="extension">
        {{ details.title }}
        <v-icon v-if="details.icon" :style="styleButton">{{ details.icon }}</v-icon>
      </v-toolbar-title>

      <v-btn v-if="allowEdit" color="secondary" small absolute bottom left fab @click="edit">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

      <slot name="eventPopoverToolbarLeft" v-bind="slotData" />

      <v-spacer />

      <slot name="eventPopoverToolbarRight" v-bind="slotData" />

      <slot name="eventPopoverToolbarActions" v-bind="slotData">
        <v-tooltip v-if="!isReadOnly" bottom color="secondary">
          <template v-slot:activator="{ on }">
            <schedule-actions
              v-on="on"
              v-bind="{ $scopedSlots }"
              :schedule="calendarEvent.schedule"
              :calendar-event="calendarEvent"
              :calendar="calendar"
            >
              <!-- <v-btn icon :style="styleButton" @click.stop="remove">
                <v-icon>mdi-delete</v-icon>
              </v-btn> -->
            </schedule-actions>
          </template>
          <span>{{ labels.options }}</span>
        </v-tooltip>
      </slot>

      <slot name="eventPopoverToolbarClose" v-bind="slotData">
        <v-btn icon :style="styleButton" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </slot>
    </v-toolbar>
    <v-card-text>
      <slot name="eventPopoverBodyTop" v-bind="slotData" />

      <v-list dense>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-clock-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot name="eventPopoverOccurs" v-bind="slotData">
              <v-list-item-title>{{ startDate }}</v-list-item-title>
              <v-list-item-subtitle>{{ occurs }}</v-list-item-subtitle>
            </slot>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="details.location">
          <v-list-item-avatar>
            <v-icon>mdi-map-marker</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot name="eventPopoverLocation" v-bind="slotData">
              <v-list-item-title>
                <span v-html="details.location" />
              </v-list-item-title>
            </slot>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="details.description">
          <v-list-item-avatar>
            <v-icon>mdi-text-subject</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot name="eventPopoverDescription" v-bind="slotData">
              <v-list-item-title>
                <span v-html="details.description" />
              </v-list-item-title>
            </slot>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="details.notify">
          <v-list-item-avatar>
            <v-icon>mdi-bell</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot name="eventPopoverNotifications" v-bind="slotData">
              <v-list-item-title>
                <span v-html="details.notify" />
              </v-list-item-title>
            </slot>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="details.calendar">
          <v-list-item-avatar>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot name="eventPopoverCalendar" v-bind="slotData">
              <v-list-item-title>
                <span v-html="details.calendar" />
              </v-list-item-title>
            </slot>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <slot name="eventPopoverBodyBottom" v-bind="slotData" />
    </v-card-text>

    <slot name="eventPopoverActions" v-bind="slotData" />
  </v-card>
</template>

<script>
import {
  Day,
  Calendar,
  CalendarEvent,
  Schedule,
  Functions as fn
} from "dayspan";

import moment from "moment";

import ScheduleActions from "./ScheduleActions";

export default {
  name: "dsCalendarEventPopover",
  components: {
    ScheduleActions
  },
  props: {
    calendarEvent: {
      required: true,
      type: CalendarEvent
    },

    calendar: {
      required: true,
      type: Calendar
    },

    readOnly: {
      type: Boolean,
      default: false
    },

    edit: {
      type: Function
    },

    allowEditOnReadOnly: {
      type: Boolean,
      default() {
        return this.$dsDefaults().allowEditOnReadOnly;
      }
    },

    close: {
      type: Function
    },

    formats: {
      validate(x) {
        return this.$dsValidate(x, "formats");
      },
      default() {
        return this.$dsDefaults().formats;
      }
    },

    labels: {
      validate(x) {
        return this.$dsValidate(x, "labels");
      },
      default() {
        return this.$dsDefaults().labels;
      }
    }
  },

  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },

    slotData() {
      return {
        calendarEvent: this.calendarEvent,
        calendar: this.calendar,
        edit: this.edit,
        close: this.close,
        details: this.details,
        readOnly: this.readOnly
      };
    },

    classes() {
      return {
        "ds-event-cancelled": this.calendarEvent.cancelled
      };
    },

    styleHeader() {
      return {
        backgroundColor: this.details.color,
        color: this.details.forecolor
      };
    },

    styleButton() {
      return {
        color: this.details.forecolor
      };
    },

    startDate() {
      return this.calendarEvent.start.format(this.formats.start);
    },

    busyness() {
      return this.details.busy ? this.labels.busy : this.labels.free;
    },

    hasBusy() {
      return typeof this.details.busy === "boolean";
    },

    occurs() {
      const timeout = this.calendarEvent.event.data.timeout;
      const now = new Date(this.calendarEvent.start.format(""));
      now.setDate(now.getDate() + parseInt(timeout.day));
      now.setHours(now.getHours() + parseInt(timeout.hour));
      now.setMinutes(now.getMinutes() + parseInt(timeout.minute));
      return this.calendarEvent.start.format('h:mm a > ') + moment(now).format('MMMM D, h:mm a');
    },

    details() {
      return this.calendarEvent.event.data;
    },

    allowEdit() {
      return this.allowEditOnReadOnly || !this.isReadOnly;
    },

    isReadOnly() {
      return this.readOnly || this.$dayspan.readOnly || this.details.readonly;
    }
  },

  // eslint-disable-next-line
  data: vm => ({}),

  methods: {
    getEvent(type, extra = {}) {
      return fn.extend(
        {
          type: type,
          day: this.day,
          schedule: this.schedule,
          target: this.targetSchedule,
          details: this.details,
          targetDetails: this.targetDetails,
          calendar: this.calendar,
          calendarEvent: this.calendarEvent,
          handled: false,
          refresh: true,
          create: true,
          added: false,
          $vm: this,
          $element: this.$el
        },
        extra
      );
    }
  }
};
</script>

<style scoped lang="scss">
.ds-calendar-event-popover-card {
  .v-btn--floating.v-btn--left {
    margin-left: 0px !important;

    .v-icon {
      height: auto;
    }
  }

  .v-card__text {
    padding: 16px 0;

    .v-list {
      .v-list__tile {
        padding: 0px !important;
        height: auto;

        .v-list__tile__sub-title {
        }
      }
    }
  }

  .v-toolbar__extension {
    padding: 0 16px !important;

    .v-toolbar__title {
      margin-left: 56px;
    }
  }
}
</style>
