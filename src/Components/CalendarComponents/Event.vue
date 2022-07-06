<template>
  <v-card class="elevation-12 ds-event no-scroll" :class="classes">
    <v-toolbar color="primary" dark flat>
      <div v-if="importOnly" style="flex: 1" />
      <div v-if="hasCancel" :class="importOnly ? '' : 'ds-event-cancel'">
        <!-- Cancel -->
        <slot name="scheduleCancel" v-bind="{ cancel, labels }">
          <v-tooltip bottom color="secondary">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="cancel">
                <v-icon dark>mdi-close</v-icon>
              </v-btn>
            </template>
            <span v-html="labels.cancel" />
          </v-tooltip>
          <span v-if="importOnly" class="ml-3">{{ $t('importSchedule') }}</span>
        </slot>
      </div>

      <slot
        v-if="!importOnly"
        name="scheduleTitle"
        v-bind="{ schedule, schedule, calendarEvent, details }"
      >
        <v-select
          v-model="details.title"
          :items="activityNames"
          :placeholder="$t('selectActivity')"
          :disabled="importOnly"
          dense
          outlined
        />
      </slot>

      <div
        v-if="!importOnly"
        class="ds-event-actions"
        style="display: flex"
      >
        <!-- Save -->
        <slot name="scheduleSave" v-bind="{ hasSave, save, labels, readOnly }">
          <v-btn
            v-if="!isReadOnly"
            class="ds-button-tall"
            depressed
            color="primary"
            :disabled="!canSave || importOnly"
            @click.stop="save"
          >
            <span v-html="labels.save" />
          </v-btn>
        </slot>

        <!-- More Actions -->
        <slot
          name="scheduleActions"
          v-bind="{ calendarEvent, schedule, calendar, actioned, readOnly }"
        >
          <schedule-actions
            v-if="calendarEvent && !isReadOnly"
            v-bind="{ $scopedSlots }"
            v-on="$listeners"
            :schedule="schedule"
            :calendar-event="calendarEvent"
            :calendar="calendar"
            @finish="actioned"
          >
            <v-btn
              class="ds-button-tall"
              color="primary"
              @click.stop="remove(calendarEvent.event.id)"
              depressed
              >{{ $t('remove') }}</v-btn
            >
          </schedule-actions>
        </slot>
      </div>

      <!-- Title -->
    </v-toolbar>

    <v-card-text class="ds-event-details">


      <!-- Tabs -->
      <v-layout v-if="hasTabs">
        <v-flex xs12 :class="importOnly ? 'hide-tabs' : ''">
          <v-tabs v-model="tab" class="text--primary">
            <v-tab v-if="hasDetails && !importOnly" href="#details">
              {{ $t('activityAccessOptions') }}
            </v-tab>

            <v-tab v-if="!importOnly" href="#notifications">
              {{ $t('notifications') }}
            </v-tab>

            <v-tab v-if="importOnly" href="#import">
              {{ $t('importSchedule') }}
            </v-tab>

            <v-tab v-if="showForecast" href="#forecast">
              {{ labels.tabs.forecast }}
            </v-tab>

            <v-tab v-if="showExclusions" href="#exclusions">
              {{ labels.tabs.removed }}
            </v-tab>

            <v-tab v-if="showInclusions" href="#inclusions">
              {{ labels.tabs.added }}
            </v-tab>

            <v-tab v-if="showCancels" href="#cancelled">
              {{ labels.tabs.cancelled }}
            </v-tab>

            <slot name="eventTabsExtra" v-bind="slotData" />

            <!-- Details -->
            <v-tab-item v-if="hasDetails" value="details">
              <v-card text>
                <v-card-text>
                  <div class="ds-event-body ds-event-area">
                    <slot name="schedule" v-bind="slotData">
                      <!-- absolute scheduling options below -->
                      <my-schedule
                        @onTimeout="handleTimeout"
                        @onTimedActivity="handleTimedActivity"
                        @onIdleTime="handleIdleTime"
                        @onExtendedTime="handleExtendedTime"
                        @onCompletion="handleCompletion"
                        @onScheduledDay="handleScheduledDay"
                        @onAvailability="handleAvailability"
                        :availability="availability"
                        :completion="completion"
                        :onlyScheduledDay="scheduledDay"
                        :initial-timed-activity="initialTimedActivity"
                        :timeout="timeout"
                        :idle-time="idleTime"
                        :schedule="schedule"
                        :day="day"
                        :read-only="readOnly"
                        :extended-time="extendedTime"
                        :is-timeout-valid="isTimeoutValid"
                      />
                    </slot>
                  </div>
                  <!-- Max number of responses -->
                  <!-- max # of responses
                  <v-text-field
                    v-model="details.maxResponses"
                    single-line
                    hide-details
                    solo
                    text
                    type="number"
                    :value="1"
                  />-->
                </v-card-text>
              </v-card>
            </v-tab-item>

            <!-- Notifications -->
            <v-tab-item v-if="hasDetails" value="notifications">
              <v-card text>
                <v-card-text>
                  <Notification
                    :details="details"
                    @updatedNotification="
                      (n) => {
                        details.notifications = n;
                      }
                    "
                    @updatedReminder="
                      (r) => {
                        details.reminder = r;
                      }
                    "
                  />
                </v-card-text>
              </v-card>
            </v-tab-item>

            <!-- Import Schedule -->
            <v-tab-item value="import">
              <p class="mx-2"> Please upload a schedule table (.csv file format as below) </p>
              <v-card text>
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :items-per-page="5"
                  class="elevation-1"
                ></v-data-table>
              </v-card>
              <div class="d-flex justify-space-between mt-4">
                <v-btn
                  outlined
                  color="primary"
                  @click.stop="downloadTemplate"
                >
                  {{ !eventCount ? 'Download Template' : 'Export Schedule' }}(.csv)
                </v-btn>
                <div>
                  <form enctype="multipart/form-data">
                      <input
                        class="import-file ds-display-none"
                        accept=".csv"
                        type="file"
                        @change="onFileChange"
                        :key="csvFileKey"
                      />
                  </form>

                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="blue-grey"
                        class="white--text mx-2"
                        @click="handleImportBtn"
                      >
                        Import
                        <v-icon
                          right
                          dark
                        >
                          mdi-cloud-upload
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Please make sure to use correct csv editor to build/edit csv file</span>
                  </v-tooltip>

                  <v-btn
                    color="info"
                    @click="openScheduledDlg"
                    :disabled="!isImported"
                  >
                    Submit
                  </v-btn>
                </div>
              </div>
            </v-tab-item>

            <!-- Forecast -->
            <v-tab-item v-if="showForecast" value="forecast" lazy>
              <v-card text>
                <v-card-text>
                  <slot name="eventForecast" v-bind="slotData">
                    <schedule-forecast
                      :schedule="schedule"
                      :day="day"
                      :read-only="readOnly"
                    />
                  </slot>
                </v-card-text>
              </v-card>
            </v-tab-item>

            <!-- Exclusions -->
            <v-tab-item v-if="showExclusions" value="exclusions" lazy>
              <v-card text>
                <v-card-text>
                  <slot name="eventExclusions" v-bind="slotData">
                    <schedule-modifier
                      :description="labels.exclusions"
                      :modifier="schedule.exclude"
                      :read-only="readOnly"
                    />
                  </slot>
                </v-card-text>
              </v-card>
            </v-tab-item>

            <!-- Inclusions -->
            <v-tab-item v-if="showInclusions" value="inclusions" lazy>
              <v-card text>
                <v-card-text>
                  <slot name="eventInclusions" v-bind="slotData">
                    <schedule-modifier
                      :description="labels.inclusions"
                      :modifier="schedule.include"
                      :read-only="readOnly"
                    />
                  </slot>
                </v-card-text>
              </v-card>
            </v-tab-item>

            <!-- Cancelled -->
            <v-tab-item v-if="showCancels" value="cancelled" lazy>
              <v-card text>
                <v-card-text>
                  <slot name="eventCancels" v-bind="slotData">
                    <schedule-modifier
                      :description="labels.cancelled"
                      :modifier="schedule.cancel"
                      :read-only="readOnly"
                    />
                  </slot>
                </v-card-text>
              </v-card>
            </v-tab-item>

            <slot name="eventTabItemsExtra" v-bind="slotData" />
          </v-tabs>
        </v-flex>
      </v-layout>
    </v-card-text>
    <ConfirmationDialog
      v-model="scheduleDialog"
      :dialogText="$t('submitScheduleConfirmation')"
      :title="$t('importSchedule')"
      @onOK="saveSchedule"
    />
    <ConfirmationDialog
      v-model="cancelDialog"
      :dialogText="$t('cancelImportedCsv')"
      :title="$t('closeImport')"
      @onOK="cancelImport"
    />
    <v-dialog
      v-model="validationDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('csvValidationTitle') }}
        </v-card-title>

        <v-card-text>
          {{ validationMsg }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="validationDialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import {
  Day,
  Time,
  Weekday,
  Calendar,
  CalendarEvent,
  Schedule,
  Pattern,
  Functions as fn,
} from "dayspan";
import _ from "lodash";
import moment from "moment";
import Notification from "./Notification";
import ScheduleModifier from "./ScheduleModifier";
import ScheduleForecast from "./ScheduleForecast";
import ScheduleActions from "./ScheduleActions";
import mySchedule from "./Schedule";
import ConfirmationDialog from "../Utils/dialogs/ConfirmationDialog";
import api from "../Utils/api/api";
import ObjectToCSV from 'object-to-csv';
import { VueCsvImport } from 'vue-csv-import';
import {addActivityColor, getEventColor} from "@/Components/CalendarComponents/activityColorPalette.js";
export default {
  name: "dsEvent",

  components: {
    Notification,
    mySchedule,
    ScheduleForecast,
    ScheduleModifier,
    ScheduleActions,
    ConfirmationDialog,
    VueCsvImport
  },

  props: {
    activities: {
      type: Array,
      required: true,
    },
    importOnly: {
      type: Boolean,
      default: false,
    },
    targetSchedule: {
      required: true,
      type: Schedule,
    },

    targetDetails: {
      type: Object,
      required: true,
    },

    calendarEvent: {
      type: CalendarEvent,
    },

    calendar: {
      type: Calendar,
    },

    day: {
      type: Day,
    },

    readOnly: {
      type: Boolean,
      default: false,
    },

    labels: {
      validate(x) {
        return this.$dsValidate(x, "labels");
      },
      default() {
        return this.$dsDefaults().labels;
      },
    },

    hasTitle: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasTitle;
      },
    },

    hasCancel: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasCancel;
      },
    },

    hasSave: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasSave;
      },
    },

    hasTabs: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasTabs;
      },
    },

    hasDetails: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasDetails;
      },
    },

    hasForecast: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasForecast;
      },
    },

    hasExclusions: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasExclusions;
      },
    },

    hasInclusions: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasInclusions;
      },
    },

    hasCancelled: {
      type: Boolean,
      default() {
        return this.$dsDefaults().hasCancelled;
      },
    },

    busyOptions: {
      type: Array,
      default() {
        return this.$dsDefaults().busyOptions;
      },
    },
  },

  data: (vm) => {
    return {
      tab: "details",
      schedule: new Schedule(),
      details: vm.$dayspan.getDefaultEventDetails(),
      oneTimeCompletion: false,
      eventAvailability: null,
      onlyScheduledDay: false,
      scheduledExtendedTime: {},
      scheduledTimeout: {},
      timedActivity: {},
      scheduledIdleTime: {},
      scheduleDialog: false,
      cancelDialog: false,
      scheduleImport: false,
      validationDialog: false,
      validationMsg: "",
      csvFileKey: 0,
      headers: [
        {
          text: 'Activity Name',
          align: 'start',
          sortable: true,
          value: 'name',
        },
        { text: 'Date', value: 'date' },
        { text: 'Activity Start Time', value: 'startTime' },
        { text: 'Activity End Time', value: 'endTime' },
        { text: 'Notification Time', value: 'notificationTime' },
        { text: 'Repeats', value: 'repeats' },
        { text: 'Frequency', value: 'frequency' },
      ],
      items: [
        {
          name: 'Flanker',
          date: '01/13/2022',
          startTime: '0800',
          endTime: '1640',
          notificationTime: '1400',
          repeats: 'Yes',
          frequency: 'Daily',
        }, {
          name: 'Screener',
          date: '11/03/2022',
          startTime: '0435',
          endTime: '2240',
          notificationTime: '1230',
          repeats: 'Yes',
          frequency: 'Weekly',
        }, {
          name: 'EMA',
          date: '04/22/2022',
          startTime: '1030',
          endTime: '1130',
          notificationTime: '1030',
          repeats: 'Yes',
          frequency: 'Week Day',
        }, {
          name: 'TokenLogger',
          date: '12/07/2022',
          startTime: '2230',
          endTime: '2300',
          notificationTime: '2245',
          repeats: 'Yes',
          frequency: 'Monthly',
        }, {
          name: 'Cognitive Battery',
          date: '05/19/2022',
          startTime: '1750',
          endTime: '1846',
          notificationTime: '1750',
          repeats: 'No',
          frequency: '',
        },
      ],
      referencedUsersCSV: [],
      isImported: false,
      eventCount: 0,
    }
  },

  computed: {
    ownerType() {
      return Object.keys(this.$store.state.currentUsers).length ? 'individual' : 'Group';
    },
    userCode() {
      return Object.values(this.$store.state.currentUsers).map(user => user.MRN || user.email).join(', ');
    },
    title() {
      return this.details.title;
    },
    completion() {
      return this.details.completion || false;
    },
    availability() {
      return this.details.availability && true;
    },
    scheduledDay() {
      return this.details.onlyScheduledDay || false;
    },
    initialTimedActivity() {
      return (
        this.details.timedActivity || {
          hour: 1,
          minute: 0,
          second: 0,
          allow: false,
        }
      );
    },
    timeout() {
      return (
        this.details.timeout || {
          day: 0,
          hour: 12,
          minute: 0,
          access: false,
          allow: false,
        }
      );
    },
    reminder() {
      return (
        this.details.reminder || {
          valid: false,
          days: 0,
          time: "",
        }
      );
    },
    extendedTime() {
      return (
        this.details.extendedTime || {
          days: 7,
          allow: false,
        }
      );
    },
    idleTime() {
      return (
        this.details.idleTime || {
          minute: 1,
          allow: false,
        }
      );
    },
    currentApplet() {
      return this.$store.state.currentAppletMeta;
    },
    activityNames() {
      return _.map(this.activities, (a) => a.name);
    },
    slotData() {
      return {
        targetSchedule: this.targetSchedule,
        targetDetails: this.targetDetails,
        schedule: this.schedule,
        details: this.details,
        timeout: this.details.timeout,
        initialTimedActivity: this.details.timedActivity,
        completion: this.details.completion,
        availability: this.details.availability,
        scheduledDay: this.details.onlyScheduledDay,
        idleTime: this.details.idleTime,
        extendedTime: this.details.extendedTime,
        busyOptions: this.busyOptions,
        day: this.day,
        calendar: this.calendar,
        calendarEvent: this.calendarEvent,
        labels: this.labels,
        readOnly: this.readOnly,
      };
    },

    classes() {
      return {
        "ds-has-cancel": this.hasCancel,
        "ds-event-small": this.$vuetify.breakpoint.smAndDown,
      };
    },

    isTimeoutValid() {
      if (!this.details.timeout.allow) {
        return true;
      }

      if (this.details.timeout.day < 0) {
        return false;
      }

      if (this.details.timeout.day === 0 && this.details.timeout.hour < 0) {
        return false;
      }

      if (
        this.details.timeout.day == 0 &&
        this.details.timeout.hour == 0 &&
        this.details.timeout.minute <= 0
      ) {
        return false;
      }

      // If 'Allow timeout' is checked & every value is 0, form is invalid
      return true;
    },

    canSave() {
      const isValidDayspanEvent = this.$dayspan.isValidEvent(
        this.details,
        this.schedule,
        this.calenderEvent
      );

      if (this.details.useNotifications && (!this.details.notifications || this.details.notifications.length === 0)) {
        return false;
      }
      if (this.details.notifications && this.details.useNotifications) {
        for (const notification of this.details.notifications) {
          if (this.details.useNotifications && (!notification.allow && !notification.random)) {
            return false;
          }
          if (notification.allow && (!notification.start || !notification.start.match(/\d{2}:\d{2}/))) {
            return false;
          }
          if (notification.random && (!notification.end || !notification.end.match(/\d{2}:\d{2}/))) {
            return false;
          }
        }
      }

      const isTimeoutValid = this.isTimeoutValid;

      return isValidDayspanEvent && isTimeoutValid;
    },

    repeats() {
      return !this.schedule.isSingleEvent();
    },

    showTitle() {
      return this.$dayspan.supports.title && this.hasTitle;
    },

    showCancels() {
      return (
        this.$dayspan.features.cancel &&
        this.repeats &&
        this.hasCancelled &&
        !this.schedule.cancel.isEmpty()
      );
    },

    showForecast() {
      return (
        this.$dayspan.features.forecast && this.repeats && this.hasForecast
      );
    },

    showExclusions() {
      return (
        this.$dayspan.features.exclude &&
        this.repeats &&
        this.hasExclusions &&
        !this.schedule.exclude.isEmpty()
      );
    },

    showInclusions() {
      return (
        this.$dayspan.features.include &&
        this.repeats &&
        this.hasInclusions &&
        !this.schedule.include.isEmpty()
      );
    },

    isReadOnly() {
      return this.readOnly || this.$dayspan.readOnly;
    },
  },

  watch: {
    targetSchedule: {
      handler: "updateSchedule",
      immediate: true,
    },

    targetDetails: {
      handler: "updateDetails",
      immediate: true,
    },
    title() {
      const res = _.filter(this.activities, (a) => a.name === this.title);
      if (res.length)
      {
        this.details.URI = res[0].URI;
        const activityColor = getEventColor(res[0].id)
        if(activityColor)
        {
          this.details.color = this.getHexColor(activityColor)
        }
      }
    },
  },

  created () {
    let state = this.calendar.toInput(true);

    if (this.ownerType === 'Group') {
      this.headers.push({ text: 'Secret User ID', value: 'secretId' })
      this.items = this.items.map((item, i) => ({...item, secretId: i === 1 ? 'MRN1' : i % 2 === 0 ? '' : 'MRN1, MRN2'}));
    } 

    if (state.events.length && this.importOnly) {
      this.eventCount = state.events.length;
      this.items = [];

      this.getUserList().then(users => {
        const userIdToMrn = {};
        for (let i = 0; i < users.length; i++) {
          userIdToMrn[users[i]._id] = users[i].MRN || users[i].email || '';
        }

        const padZero = (number, length=2) => {
          return number.toString().padStart(length, '0');
        };

        const getDateForSchedule = (schedule, pattern) => {
          let day = new Date();

          if (pattern == 'weekly' || pattern == 'weekday') {
            day.setDate(day.getDate() - day.getDay() + schedule.dayOfWeek[0]);
          }

          if (pattern == 'monthly') {
            day.setDate(schedule.dayOfMonth[0])
          }

          return `${padZero(day.getMonth() + 1)}/${padZero(day.getDate())}/${day.getFullYear()}`;
        }

        for (const event of state.events) {
          const pattern = Pattern.findMatch(event.schedule)
          const types = { daily: 'Daily', weekly: 'Weekly', weekday: 'Week Day', monthly: 'Monthly' }
          const eventUsers = event.data.users || [];
          let date = '';

          if (event.schedule.year && event.schedule.month && event.schedule.dayOfMonth) {
            date = `${padZero(event.schedule.month[0] + 1)}/${padZero(event.schedule.dayOfMonth[0])}/${event.schedule.year[0]}`;
          } else {
            date = getDateForSchedule(event.schedule, pattern.name);
          }

          const [startHour, startMinute] = event.schedule.times ? event.schedule.times[0].split(':') : [0, 0];
          let endHour = startHour, endMinute = startMinute;

          if (event.data.timeout) {
            endHour = Number(startHour || 0) + Number(event.data.timeout.hour);
            endMinute = Number(startMinute || 0) + Number(event.data.timeout.minute);

            endHour += Math.floor(endMinute / 60);
            endMinute %= 60;

            if (endHour >= 24) endHour = 23;
          }
          const obj = {
            name: event.data.title,
            date,
            startTime: `${padZero(startHour || 0)}${padZero(startMinute || 0)}`,
            endTime: `${padZero(endHour || 0)}${padZero(endMinute || 0)}`,
            notificationTime: event.data.useNotifications ? event.data.notifications[0].start.replace(':', '') : '',
            repeats: types[pattern.name] ? 'Yes' : 'No',
            frequency: types[pattern.name] || '',
          };
          if (this.ownerType === "Group") {
            obj.secretId = eventUsers.map(userId => userIdToMrn[userId] || '').join(', ');
          }
          this.items.push(obj)
        }
      })
    }
  },

  methods: {
    getHexColor(colorName) {
      return _.filter(this.$dayspan.colors, c => c.text === colorName)[0].value;
    },
    async remove(eventId) {
      const res = await this.$dialog.warning({
        title: "",
        color: "#1976d2",
        text: this.$i18n.t("areYouSureRemoveEvent"),
        persistent: false,
        actions: {
          No: this.$i18n.t("no"),
          Yes: {
            color: "#1976d2",
            text: this.$i18n.t("yes"),
          },
        },
      });
      if (res === "Yes") {
        let ev = this.getEvent("save");
        this.$emit("remove", ev);

        if (!ev.handled && ev.calendar) {
          ev.calendar.removeEvent(ev.calendarEvent.event);
          ev.handled = true;
        }

        const state = this.calendar.toInput(true);
        const storeState = this.$store.state;

        let oldStateEvents = [];
        let newStateEvents = [];
        if (state && storeState) {
          try {
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
            } else if (oldStateEvents.length > newStateEvents.length) {
              let index = 0;
              const events = newStateEvents.map((event) => {
                const ev = event;
                const newEvent = oldStateEvents[index];
                if (!newEvent) {
                  return ev;
                }
                if (newEvent.id) {
                  delete newEvent["id"];
                  if (JSON.stringify(ev) === JSON.stringify(newEvent)) {
                    ev.id = oldStateEvents[index].id;
                  } else {
                    index += 1;
                  }
                }
                index += 1;
                return ev;
              });
              state.events = events;
              this.$store.commit("addRemovedEventId", eventId);
            }
          }
          this.$store.commit("setSchedule", state);
          this.$store.commit("setCachedEvents", state.events);
        }
        this.$emit("event-remove", ev.event);
        this.$emit("cancel", this.getEvent("cancel"));
      }
    },

    handleTimeout(scheduledTimeout) {
      this.scheduledTimeout = scheduledTimeout;
    },

    handleTimedActivity(timedActivity) {
      this.timedActivity = timedActivity;
    },

    handleIdleTime(scheduledIdleTime) {
      this.scheduledIdleTime = scheduledIdleTime;
    },

    handleExtendedTime(scheduledExtendedTime) {
      this.scheduledExtendedTime = scheduledExtendedTime;
    },

    handleScheduledDay(onlyScheduledDay) {
      this.onlyScheduledDay = onlyScheduledDay;
    },

    handleCompletion(oneTimeCompletion) {
      this.oneTimeCompletion = oneTimeCompletion;
    },

    handleAvailability(availability) {
      this.eventAvailability = availability;
    },

    handleImportBtn() {
      this.csvFileKey++;
      setTimeout(() => {
        this.$el.querySelector("input.import-file").click();
      })
    },

    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        return;
      }
      this.createInput(files[0]);
    },

    getUserList () {
      return api.getAppletUsers({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: this.currentApplet.id,
      }).then(resp => resp.data.active)
    },

    createInput(file) {
      const reader = new FileReader();
      const vm = this;
      this.validationMsg = '';

      reader.onload = (e) => {
        const lines = reader.result.split('\n')
        const headers = lines[0].split(',').map(header => {
          const value = header.replace(/\"/g, '').replace(/\r/g, '');
          const headerItem = this.headers.find(h => h.text === value);

          if (headerItem) {
            return headerItem.value;
          }
          return value;
        })

        const importedItems = lines.slice(1).map(line => {
          let fields = [];
          if (line.match(/^\s*"/)) {
            fields = line.split(/"\s*,\s*"/).map(field => field.replace(/[\"\r\n]/g, ''));
          } else {
            fields = line.split(',').map(field => field.replace(/[\"\r\n]/g, ''))
          }

          return Object.fromEntries(headers.map((h, i) => [h, fields[i]]))
        }).filter(line => {
          if (line.name === '' || line.name === undefined) {
            return false;
          }
          return true;
        })

        if (!importedItems.length) {
          this.validationMsg = 'The table failed to upload. Please ensure you have followed the format exactly and try again.';
        }

        const activityNames = [];
        for (const actId in this.$store.state.currentAppletData.activities) {
          const prefLabel = "http://www.w3.org/2004/02/skos/core#prefLabel";
          const activityName = _.get(this.$store.state.currentAppletData.activities[actId], [prefLabel, 0, '@value']);
          activityNames.push(activityName);
        }

        const validateTime = (time) => {
          if (!time) return true;
          if (isNaN(time) || time < 0) return false;
          if (time.length > 4 || time.length < 3) return false;

          const hour = Number(time.slice(0, -2)), minutes = Number(time.slice(-2));

          if (hour >= 24) return false;
          if (minutes >= 60) return false;

          return true;
        }
        for (let i = 0; i < importedItems.length; i += 1) {
          const { startTime, endTime, name, repeats, frequency, date, notificationTime } = importedItems[i];

          const month = Number(date.split('/').shift());
          if (isNaN(new Date(date)) || isNaN(month) || month < 0 || month > 12 ) {
            this.validationMsg = 'You have invalid date in csv. Please fix and reupload.';
            break;
          }

          if (!validateTime(startTime) || !validateTime(endTime)) {
            this.validationMsg = 'You have invalid start time or end time in csv. Please fix and reupload.'
            break;
          }

          if (!validateTime(notificationTime)) {
            this.validationMsg = 'You have invalid notification time. Please fix and reupload.'
            break;
          }

          if (notificationTime && isNaN(notificationTime)) {
            this.validationMsg = 'You have invalid notification time in csv. Please fix and reupload.';
            break;
          }

          if (Number(startTime) > Number(endTime)) {
            this.validationMsg = 'We are unable to upload this schedule. You have an end time that is before a start time. Please fix and reupload.';
            break;
          }

          if (frequency === undefined || repeats === undefined) {
            this.validationMsg = 'The table failed to upload. Please ensure you have followed the format exactly and try again.';
            break;
          }

          if (!['daily', 'weekly', 'weekday', 'monthly', ''].includes(frequency.toLowerCase().replace(/\s/g, ''))) {
            this.validationMsg = 'You have invalid frequency value in csv. Please fix and reupload.';
            break;
          }

          if (!['yes', 'no'].includes(repeats.toLowerCase().replace(/\s/g, ''))) {
            this.validationMsg = 'You have invalid repeat value in csv. Please fix and reupload.';
            break;
          }

          if (repeats.replace(/\s/g, '') === 'Yes' && frequency.replace(/\s/g, '') === '') {
            this.validationMsg = 'You are missing a frequency to repeat *Activity name*. Please fix and reupload.';
            break;
          }

          if (repeats.replace(/\s/g, '') !== 'Yes' && frequency.replace(/\s/g, '') !== '') {
            this.validationMsg = 'You have a frequency set but have entered no repeating. Please fix and reupload.';
            break;
          }

          if (!activityNames.includes(name)) {
            this.validationMsg = '*Activity Name* is not valid. Please fix and reupload.';
            break;
          }
        }

        this.getUserList().then(allUsers => {
          const mrnToUserId = {};

          this.referencedUsersCSV = [];
          for (let i = 0; i < allUsers.length; i++) {
            mrnToUserId[allUsers[i].MRN || allUsers[i].email] = allUsers[i]._id;
          }

          for (let i = 0; i < importedItems.length; i++) {
            const secretIds = (importedItems[i].secretId || '').split(', ').map(secretId => secretId.trim()).filter(secretId => secretId);
            const users = [];
            if (this.ownerType === "Group") {
              for (const secretId of secretIds) {
                if (!mrnToUserId[secretId]) {
                  this.validationMsg = 'You have invalid secret id in csv.';
                  break;
                }
                users.push(mrnToUserId[secretId]);
              }
            } else {
              users.push(mrnToUserId[this.userCode]);
            }
            importedItems[i].users = users.sort();
            this.referencedUsersCSV.push(importedItems[i].users.join(','));
          }

          if (this.validationMsg) {
            this.validationDialog = true;
          } else {
            vm.items = importedItems;
            this.validationDialog = false;
            this.isImported = true;
          }
        });
      }
      reader.readAsText(file);
    },

    openScheduledDlg() {
      this.scheduleDialog = true;
    },
    saveSchedule() {
      let ev = this.getEvent("save");

      let state = this.calendar.toInput(true);

      for (const event of state.events) {
        if (this.referencedUsersCSV.includes((event.data.users || []).sort().join(','))) {
          this.calendar.removeEvent(this.calendar.findEvent(event.id));
          this.$store.commit('addRemovedEventId', event.id);
        }
      }

      this.scheduleImport = true;
      this.isOverlap = false;

      this.items.forEach(row => {
        let { notificationTime, name, startTime, endTime, date, repeats, frequency } = row;
        const res = _.filter(this.activities, (a) => a.name === name);
        let timeout = {
          access: false,
          allow: true,
          day: 0,
        };

        if (!startTime) startTime = '0000';
        if (!endTime) endTime = '2359';

        if (startTime.length < 4) startTime = '0' + startTime;
        if (endTime.length < 4) endTime = '0' + endTime;
        if (notificationTime && notificationTime.length < 4) notificationTime = '0' + notificationTime;

        const eventTimes = [{
          hour: startTime.slice(0, 2),
          minute: startTime.slice(2),
          second: 0,
          millisecond: 0,
        }, {
          hour: endTime.slice(0, 2),
          minute: endTime.slice(2),
          second: 0,
          millisecond: 0,
        }]

        timeout.minute = eventTimes[1].minute - eventTimes[0].minute;
        timeout.hour = eventTimes[1].hour - eventTimes[0].hour;

        if (timeout.minute < 0) {
          timeout.minute += 60;
          timeout.hour -= 1;
        }

        if (res.length) {
          const activityColor = getEventColor(res[0].id);

          this.details.URI = res[0].URI;
          if(activityColor)
          {
            this.details.color = this.getHexColor(activityColor)
          }
        }

        const data = {
          URI: this.details.URI,
          availability: false,
          busy: false,
          calendar: "",
          completion: false,
          description: "",
          extendedTime: {
            allow: false,
            minute: 1
          },
          forecolor: "#ffffff",
          color: this.details.color,
          icon: "",
          idleTime: {
            allow: false,
            minute: 1
          },
          location: "",
          notifications: [
            {
              allow: notificationTime ? true : false,
              end: null,
              random: false,
              start: notificationTime ? [notificationTime.slice(0, 2), ":", notificationTime.slice(2)].join('') : ''
            }
          ],
          onlyScheduledDay: false,
          reminder: {
            days: 0,
            time: "",
            valid: false
          },
          timedActivity: {
            allow: false,
            hour: 0,
            minute: 59,
            second: 59
          },
          timeout,
          title: row.name,
          useNotifications: notificationTime ? true : false
        }

        if (row.users && row.users.length) {
          data.users = row.users;
        }

        const times = [];
        let eventSchedule = {};
        const dateValues = date.split('/');
        times.push(new Time(Number(eventTimes[0].hour), Number(eventTimes[0].minute), eventTimes[0].second, eventTimes[0].millisecond));

        let pattern = null;
        if (repeats) {
          switch (frequency) {
            case "Daily":
              pattern = Pattern.withName('daily');
              break;
            case "Weekly":
              pattern = Pattern.withName('weekly')
              break;
            case "Week Day":
              pattern = Pattern.withName('weekday')
              break;
            case "Monthly":
              pattern = Pattern.withName('monthly');
              break;
          }
        }

        if (pattern) {
          eventSchedule = new Schedule({
            times
          })
          pattern.apply(eventSchedule, new Day(moment(date)))
        } else {
          eventSchedule = new Schedule({
            on: Day.build(dateValues[2], dateValues[0] - 1, dateValues[1]),
            times
          })
        }

        ev.created = {
          data,
          id: null,
          schedule: eventSchedule
        };

        this.calendar.addEvent(ev.created)
      });
      this.calendar.refreshEvents();
      this.$emit("saved", ev);
      this.isImported = false;
      this.cancel();

      state = this.calendar.toInput(true);
      this.$store.commit("setSchedule", state);
      this.$store.commit("setCachedEvents", state.events);
    },

    downloadTemplate () {
      this.downloadFile({
        name: 'template.csv',
        content: new ObjectToCSV({
          data: this.items,
          keys: this.headers.map(header => ({ key: header.value, as: header.text }))
        }).getCSV(),
        type: 'text/csv;charset=utf-8'
      });
    },

    downloadFile({ name, content, type }) {
      const file = new Blob([content], { type })
      return new Promise(resolve => {
        saveAs(file, name)
        resolve(true)
      })
    },

    save() {
      var ev = this.getEvent("save");
      this.$emit("save", ev);

      if (!ev.handled) {
        if (ev.target && ev.schedule) {
          ev.target.set(ev.schedule);
        }

        if (ev.calendarEvent) {
          this.$dayspan.setEventDetails(
            ev.details,
            ev.targetDetails,
            ev.calendarEvent.event,
            ev.calendarEvent
          );

          this.$emit("update", ev);

          this.$emit("event-update", ev.calendarEvent.event);
        } else if (ev.create) {
          ev.created = this.$dayspan.createEvent(ev.details, ev.schedule);
          if (ev.calendar) {
            ev.calendar.addEvent(ev.created);
            ev.added = true;
          }
          this.$emit("create", ev);
        }

        if (ev.calendar && ev.refresh) {
          ev.calendar.refreshEvents();
        }

        ev.handled = true;
        if (ev.created) {
          this.$emit("event-create", ev.created);
        }
      }

      this.$emit("saved", ev);
    },

    actioned(ev) {
      this.$emit("actioned", ev);
    },

    cancel() {
      if (this.isImported) {
        this.cancelDialog = true;
      } else {
        this.$emit("cancel", this.getEvent("cancel"));
      }
    },

    cancelImport() {
      this.isImported = false;
      this.cancel();
    },

    updateSchedule(schedule) {
      this.schedule = schedule.clone();
      this.tab = "details";
    },

    updateDetails(details) {
      this.details = this.$dayspan.copyEventDetails(details);
      this.tab = "details";
    },

    getEvent(type, extra = {}) {
      const evDetails = this.details;

      if (this.oneTimeCompletion) {
        evDetails.completion = true;
      } else {
        evDetails.completion = false;
      }

      if (this.eventAvailability === null) {
        evDetails.availability = this.availability === undefined ? true : this.availability;
      } else {
        evDetails.availability = this.eventAvailability;
      }

      if (this.onlyScheduledDay) {
        evDetails.onlyScheduledDay = true;
      } else {
        evDetails.onlyScheduledDay = false;
      }

      if (!this.scheduledExtendedTime.hasOwnProperty("allow")) {
        this.scheduledExtendedTime = this.extendedTime;
      }
      if (!this.scheduledExtendedTime.allow) {
        evDetails.extendedTime = {
          minute: 1,
          allow: this.scheduledExtendedTime.allow,
        };
      } else {
        evDetails.extendedTime = this.scheduledExtendedTime;
      }

      if (!this.timedActivity.hasOwnProperty("allow")) {
        this.timedActivity = this.initialTimedActivity;
      }
      if (!this.timedActivity.allow) {
        evDetails.timedActivity = {
          hour: 0,
          minute: 59,
          second: 59,
          allow: this.timedActivity.allow,
        };
      } else {
        evDetails.timedActivity = this.timedActivity;
      }

      if (!this.scheduledTimeout.hasOwnProperty("allow")) {
        this.scheduledTimeout = this.timeout;
      }
      if (!this.scheduledTimeout.allow) {
        if (this.schedule.lastTime) {
          evDetails.timeout = {
            day: 0,
            hour: 23 - this.schedule.lastTime.hour,
            minute: 59 - this.schedule.lastTime.minute,
            access: this.scheduledTimeout.access,
            allow: this.scheduledTimeout.allow,
          };
        } else {
          evDetails.timeout = {
            day: 0,
            hour: 23,
            minute: 59,
            access: this.scheduledTimeout.access,
            allow: this.scheduledTimeout.allow,
          };
        }
      } else {
        evDetails.timeout = this.scheduledTimeout;
      }

      if (!this.scheduledIdleTime.hasOwnProperty("allow")) {
        this.scheduledIdleTime = this.idleTime;
      }
      if (!this.scheduledIdleTime.allow) {
        evDetails.idleTime = {
          minute: 1,
          allow: this.scheduledIdleTime.allow,
        };
      } else {
        evDetails.idleTime = this.scheduledIdleTime;
      }

      evDetails.reminder = this.reminder;

      if (Object.keys(this.$store.state.currentUsers).length) {
        evDetails.users = Object.keys(this.$store.state.currentUsers);
      }
      return fn.extend(
        {
          type: type,
          day: this.day,
          schedule: this.schedule,
          target: this.targetSchedule,
          details: evDetails,
          targetDetails: this.targetDetails,
          calendar: this.calendar,
          calendarEvent: this.calendarEvent,
          handled: false,
          refresh: true,
          create: true,
          added: false,
          $vm: this,
          $element: this.$el,
        },
        extra
      );
    },
  },
};
</script>

<style scoped lang="css">
  .hide-tabs >>> .v-tabs-bar {
    display: none !important;
  }
</style>

<style lang="scss">
.csv-import-checkbox {
  display: none;
}
.import-file {
  display: none;
}
.v-toolbar__content {
  display: -webkit-box;
}
</style>

<style scoped lang="scss">
.ds-calendar-event-title {
  font-size: 18px;
  padding-right: 8px;
  padding-top: 4px;
}

.ds-color-option {
  width: 100%;
  color: white;
  padding: 4px;
}

.ds-display-none {
  display: none;
}

.ds-button-tall {
  height: 48px;
}

.ds-event {
  &.ds-event-small {
    &.ds-has-cancel {
      .ds-event-area {
        margin-left: 0px;
      }
      .ds-event-header {
        margin-left: 60px;
        margin-bottom: 58px;
      }
    }

    .ds-event-title {
      position: absolute;
      right: 8px;
      left: -60px;
      top: 60px;
    }

    .ds-event-body {
      clear: both;
    }
  }

  .ds-event-details {
    max-height: 600px;
    overflow-y: auto;
  }

  .ds-event-area {
    position: relative;
  }

  .ds-event-actions {
    margin-left: 5px;
    float: right;
    display: flex;

    > * {
      display: inline-block;
    }
  }

  .ds-event-header {
    min-height: 60px;
  }

  .ds-event-cancel {
    margin-left: -5px;
    margin-right: 15px;
  }

  .v-input {
    margin-bottom: -26px;
  }
}
</style>
