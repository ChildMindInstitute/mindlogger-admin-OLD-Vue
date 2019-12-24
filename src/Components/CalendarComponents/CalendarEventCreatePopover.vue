-<template>
  <v-card
    class="ds-calendar-event-popover-card"
    :class="classes"
  >
    <v-app-bar
      extended
      flat
      :style="styleHeader"
    >
      <v-toolbar-title slot="extension">
        <!-- <v-text-field single-line hide-details solo text autofocus
         :label="labels.title"
         v-model="details.title"
       ></v-text-field> -->

        <v-select
          v-model="details.title"
          :items="activityNames"
          placeholder="Select Activity"
        />
      </v-toolbar-title>

      <v-btn
        v-if="!details.readonly"
        color="secondary"
        small
        absolute
        bottom
        left
        fab
        @click="edit"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

      <slot
        name="eventCreatePopoverToolbarLeft"
        v-bind="slotData"
      />

      <v-spacer />

      <slot
        name="eventCreatePopoverToolbarRight"
        v-bind="slotData"
      />

      <slot
        name="eventCreatePopoverToolbarSave"
        v-bind="slotData"
      >
        <v-btn
          class="ds-create-popover-save"
          text
          :disabled="!isValid"
          :style="styleText"
          @click="save"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          <span>{{ labels.save }}</span>
        </v-btn>
      </slot>

      <slot
        name="eventCreatePopoverToolbarClose"
        v-bind="slotData"
      >
        <v-btn
          icon
          :style="styleText"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </slot>
    </v-app-bar>
    <v-card-text>
      <slot
        name="eventCreatePopoverBodyTop"
        v-bind="slotData"
      />

      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-clock-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <slot
              name="eventCreatePopoverOccurs"
              v-bind="slotData"
            >
              <v-list-item-title>{{ startDate }}</v-list-item-title>
              <v-list-item-subtitle>{{ occurs }}</v-list-item-subtitle>
            </slot>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <slot
        name="eventCreatePopoverBodyBottom"
        v-bind="slotData"
      />
    </v-card-text>

    <slot
      name="eventCreatePopoverActions"
      v-bind="slotData"
    />
  </v-card>
</template>

<script>
import { CalendarEvent, Calendar, Functions as fn } from 'dayspan';
import _ from 'lodash';


export default {

  name: 'dsCalendarEventCreatePopover',

  props:
  {
    activities: {
      required: true,
      type: Array,
    },
    calendarEvent:
    {
      required: true,
      type: CalendarEvent
    },

    calendar:
    {
      required: true,
      type: Calendar
    },

    close:
    {
      type: Function
    },

    formats:
    {
      validate(x) {
        return this.$dsValidate(x, 'formats');
      },
      default() {
        return this.$dsDefaults().formats;
      }
    },

    icons:
    {
      validate(x) {
        return this.$dsValidate(x, 'icons');
      },
      default() {
        return this.$dsDefaults().icons;
      }
    },

    labels:
    {
      validate(x) {
        return this.$dsValidate(x, 'labels');
      },
      default() {
        return this.$dsDefaults().labels;
      }
    },

    prompts:
    {
      validate(x) {
        return this.$dsValidate(x, 'prompts');
      },
      default() {
        return this.$dsDefaults().prompts;
      }
    },

    busyOptions:
    {
      type: Array,
      default() {
        return this.$dsDefaults().busyOptions;
      }
    }
  },

  data: vm => ({
    details: vm.buildDetails()
  }),

  computed:
  {
    title() {
      return this.details.title;
    },
    activityNames() {
      return _.map(this.activities, a => a.name);
    },
    slotData()
    {
      return {
        calendarEvent: this.calendarEvent,
        calendar: this.calendar,
        close: this.close,
        details: this.details
      };
    },

    classes()
    {
      return {
        'ds-event-cancelled': this.calendarEvent.cancelled
      };
    },

    styleHeader()
    {
      return {
        backgroundColor: this.details.color,
        color: this.details.forecolor
      };
    },

    styleText()
    {
      return {
        color: this.details.forecolor
      };
    },

    startDate()
    {
      return this.calendarEvent.start.format( this.formats.start );
    },

    busyness()
    {
      return this.details.busy ? this.labels.busy : this.labels.free;
    },

    isValid()
    {
      return this.$dayspan.isValidEvent(
        this.details,
        this.calendarEvent.schedule,
        this.calendarEvent
      );
    },

    occurs()
    {
      return this.$dayspan.getEventOccurrence(
        this.calendarEvent.schedule,
        this.calendarEvent.start,
        this.labels,
        this.formats
      );
    }
  },

  watch: {
    title() {
      const res = _.filter(this.activities, a => a.name === this.title);
      const color = res[0].color;
      const hexColor = _.filter(this.$dayspan.colors, c => c.text === color)[0].value;
      this.details.color = hexColor;
      this.details.URI = res[0].URI;
    },
  },

  methods:
  {
    edit()
    {
      var ev = this.getEvent('create-edit');

      this.$emit('create-edit', ev);

      this.finishEvent( ev );
    },

    save()
    {
      let ev = this.getEvent('creating');

      this.$emit('creating', ev);

      if (!ev.handled && ev.details && ev.calendarEvent)
      {
        ev.created = ev.calendarEvent.event;

        this.$dayspan.setEventDetails(
          ev.details,
          ev.created.data,
          ev.created,
          ev.calendarEvent
        );

        if (ev.calendar)
        {
          ev.calendar.addEvent( ev.created );
          ev.added = true;
        }

        this.$emit('created', ev);

        if (ev.calendar && ev.refresh)
        {
          ev.calendar.refreshEvents();
        }

        ev.handled = true;

        this.$emit('event-create', ev.created);
      }

      this.finishEvent( ev );
    },

    finishEvent(ev)
    {
      if (ev.close)
      {
        this.close();

        this.$emit('create-popover-closed', ev);
      }
    },

    buildDetails()
    {
      let details = this.$dayspan.copyEventDetails( this.calendarEvent.event.data );

      details.title = '';

      return details;
    },

    getEvent(type, extra = {})
    {
      return fn.extend({

        type: type,
        calendarEvent: this.calendarEvent,
        calendar: this.calendar,
        close: this.close || true,
        details: this.details,
        handled: false,
        added: false,
        refresh: true,
        $vm: this,
        $element: this.$el

      }, extra);
    }
  }
}
</script>

<style scoped lang="scss">

.v-btn--floating.v-btn--left {
  margin-left: 0px !important;

  .v-icon {
    height: auto;
  }
}

.ds-calendar-event-popover-card {

  .v-toolbar__extension {
    padding: 0 16px !important;
    height: 60px !important;
    align-items: start;

    .v-toolbar__title {
      width: 100%;
      margin-left: 56px;
      margin-right: 0px;

      .v-input__slot {
        background-color: rgba(255,255,255,0.2) !important;

        input {
          caret-color: rgba(0,0,0,.87) !important;
        }
      }
    }
  }
}

.v-text-field--full-width {
  width: 100%;
}

.v-card__text {
  padding: 16px 0;

  .v-list {
    padding-bottom: 0px;

    > div:first-child {
      margin-bottom: 1em;
    }

    .v-list__tile {
      height: auto !important;
    }
  }
}

.ds-create-popover-save {
  background-color: transparent !important;
  margin-top: 9px;
}

.ds-color-option {
  width: 100%;
  color: white;
  padding: 4px;
}

.v-input {
  margin-bottom: 8px !important;
}

</style>
