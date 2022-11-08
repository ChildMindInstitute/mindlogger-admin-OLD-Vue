<template>
  <div>
    <v-switch
      :label="$t('turnOnNotifs')"
      v-model="details.useNotifications"
      flat
      class="mx-2 ds-inline-switch"
    />
    <v-container
      v-if="details.useNotifications"
      v-for="(notification, index) in notificationTimes"
      class="no-padding mb-3"
      :key="'notifi_' + index"
    >
      <!-- Start notification at -->
      <v-row class="ds-time-cell">
        <v-col class="no-padding" col="10" sm="10">
          <div>
            <div class="d-flex align-center ds-notif-ele">
              <v-switch
                :label="$t('startNotifAt')"
                v-model="notification.allow"
                flat
                class="mx-2"
              />
              <vue-timepicker
                class="ds-reminder-time"
                :disabled="!notification.allow"
                v-model="notification.start"
                close-on-complete
                :hour-range="hourRange"
                :minute-range="details.timeout.allow ? getMinuteRange(notification.start) : [[0,59]]"
                @change="otherChangeHandler($event, index, 'start')"
                @error="timepickerErrorHandler($event, index, 'start', notification.start)"
              >
              </vue-timepicker>
            </div>

            <div class="d-flex align-center ds-notif-ele">
              <v-switch
                :label="$t('randomizeEnds')"
                v-model="notification.random"
                flat
                class="mx-2"
              />

              <vue-timepicker
                class="ds-reminder-time"
                :disabled="!notification.random"
                v-model="notification.end"
                close-on-complete
                :hour-range="hourRange"
                :minute-range="details.timeout.allow ? getMinuteRange(notification.end) : [[0,59]]"
                @change="otherChangeHandler($event, index, 'end')"
                @error="timepickerErrorHandler($event, index, 'end', notification.end)"
              >
              </vue-timepicker>
            </div>
          </div>
        </v-col>
        <v-col col="2" class="d-flex justify-end">
          <v-btn
            v-if="notificationTimes.length"
            class="ds-remove-btn"
            icon
            color="grey"
            @click="remove(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <div class="ds-reminder-container">
      <v-switch
        :label="$t('reminderNotif')"
        v-model="reminder.valid"
        flat
        class="mx-2 mt-0 ds-inline-switch"
      />
      <div v-if="reminder.valid" class="ds-reminder-details">
        <div class="ds-reminder-flex">
          <label>
            {{ $t("activityCompletion") }}
            <input
              type="number"
              class="ds-reminder-day"
              v-model="reminder.days"
              min="0"
            />
            {{ $t("consecutiveDays") }}
          </label>
        </div>

        <div class="ds-reminder-flex">
          <vue-timepicker
            class="ds-reminder-time"
            v-model="reminder.time"
            :drop-direction='"up"'
            close-on-complete
            :hour-range="hourRange"
            :minute-range="details.timeout.allow ? getMinuteRange(reminder.time) : [[0,59]]"
            @change="timeChangeHandler($event, 'time')"
            @error="timepickerErrorHandler($event, 0, 'reminder', reminder.time)"
          >
          </vue-timepicker>
        </div>
      </div>
    </div>

    <div class="d-flex justify-end">
      <v-btn
        v-if="details.useNotifications"
        depressed
        color="secondary"
        class="ds-btn-cell"
        fab
        small
        @click="add(notificationTimes.length - 1)"
      >
        <v-icon dark>mdi-plus</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { Time } from "dayspan";
import _ from "lodash";
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";
import moment from "moment";

export default {
  name: "Notification",
  components: { VueTimepicker },
  props: {
    details: {
      type: Object,
      default: function () {
        return {};
      },
    },
    startTime: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      yourFormat: "hh:mm a",
      allowRandom: false,
      notificationTimes: [],
      reminder: this.details.reminder || {
        valid: false,
        days: 0,
        time: "",
      },
      notificationItem: {
        start: null,
        end: null,
        random: false,
      },
    };
  },

  watch: {
    notificationTimes: {
      deep: true,
      handler() {
        this.$emit("updatedNotification", this.notificationTimes);
      },
    },
    reminder: {
      deep: true,
      handler() {
        this.$emit("updatedReminder", this.reminder);
      },
    },
    allowRandom: function (val) {
      if (!this.notificationTimes.length) return;

      if (val) {
        this.notificationTimes.forEach((notification) => {
          notification.random = true;
        });
      } else {
        this.notificationTimes.forEach((notification) => {
          notification.random = false;
        });
      }
    },
  },

  created() {
    if (!this.notificationTimes.length) {
      this.notificationTimes.push(_.clone(this.notificationItem));
    }
  },
  mounted() {
    if (this.details.notifications) {
      this.notificationTimes = this.details.notifications;

      if (this.notificationTimes.length) {
        this.allowRandom = this.notificationTimes[0].random;
      }
    }
  },

  computed: {
    endTime() {
      if(!Time.parse(this.startTime)) return { hour: 23, minute: 59 }

      const endTimeDuration = moment.duration(this.startTime.format('HH:mm'))
        .add(this.details.timeout.hour, 'h')
        .add(this.details.timeout.minute, 'm')

      return {
        hour: endTimeDuration.hours(),
        minute: endTimeDuration.minutes()
      }
    },
    hourRange() {
      return this.details.timeout.allow ? [[this.startTime.hour, this.endTime.hour]] : [[0,23]]
    },
  },
  methods: {
    timepickerErrorHandler(errors, index, type, chosenTime) {
      if(!errors.length) return

      const { startTime, endTime } = this
      const time = Time.parse(chosenTime)
      const earlierThanActivityAvailable = time.hour < startTime.hour || time.hour === startTime.hour && time.minute < startTime.minute
      const formatTime = (timeToFormat) => Time.parse(timeToFormat).format('HH:mm')
      
      if(type !== 'reminder') {
        this.notificationTimes[index][type] = formatTime(earlierThanActivityAvailable ? startTime : endTime)
        return
      }

      this.reminder.time = formatTime(earlierThanActivityAvailable ? startTime : endTime)
    },
    add(index) {
      const n = _.clone(this.notificationTimes);
      n.splice(index + 1, 0, _.clone(this.notificationItem));
      this.notificationTimes = n;
      this.$emit("updatedNotification", this.notificationTimes);
    },
    remove(i) {
      const n = _.clone(this.notificationTimes);
      n.splice(i, 1);
      this.notificationTimes = n;
      this.$emit("updatedNotification", this.notificationTimes);
    },
    otherChangeHandler(eventData, index, type) {
      const start = `${eventData.data.HH}:${eventData.data.mm}`;
      this.notificationTimes[index][type] = start;
      this.$emit("updatedNotification", this.notificationTimes);
    },
    timeChangeHandler(eventData, type) {
      this.reminder[type] = `${eventData.data.HH}:${eventData.data.mm}`;
      this.$emit("updatedReminder", this.reminder);
    },
    getMinuteRange(time) {
      if(!Time.parse(time)) return []

      const { startTime, endTime } = this
      const chosenHour = Time.parse(time).hour
      let minuteRange = [[0, 59]]

      if(chosenHour === startTime.hour) {
        minuteRange[0][0] = startTime.minute
      }

      if(chosenHour === endTime.hour) {
        minuteRange[0][1] = endTime.minute
      }

      return minuteRange
    }
  },
};
</script>

<style scoped lang="scss">
.ds-inline-switch {
  display: inline-flex;
}

.ds-notifications {
  display: flex;
  justify-content: flex-start;
  padding: 0 8px;
}

.ds-notification-cell {
  margin-right: 50px;
}

.ds-btn-cell {
  margin-right: 10px;
}

.ds-notification-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
}

.ds-reminder-details {
  padding: 0 56px;
}

.ds-reminder-flex {
  display: flex;
  align-items: center;
  font-size: 15px;
}

.ds-reminder-time {
  max-width: 125px;
  margin: 0 0 0 10px;
  padding: 0;
}

.ds-time-cell:hover {
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}

.ds-remove-btn {
  display: none;
}

.ds-time-cell:hover .ds-remove-btn {
  display: block;
}

.ds-notif-ele {
  height: 40px;
}

.ds-reminder-container {
  padding: 0px 0px 5px 0px;
}

.ds-reminder-day {
  margin: 0 7px;
  border-bottom: 1px solid grey;
  padding: 0;
  width: 35px;
  font-size: 16px;
  text-align: center;
}

.no-padding {
  padding: 0 20px;
}

.vue__time-picker::v-deep .dropdown ul li:not([disabled]).active {
  background: #1976d2;
}
</style>
