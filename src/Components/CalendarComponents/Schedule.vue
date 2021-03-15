<template>
  <div class="ds-schedule mx-6" :class="classes">
    <div class="d-flex mt-4">
      <v-switch 
        :label="$t('alwaysAvailable')" 
        :readonly="isReadOnly"
        v-model="eventAvailability"
        flat
      />
    </div>

    <div v-if="eventAvailability">
      <div class="d-flex">
        <v-switch 
          v-model="oneTimeCompletion"
          :label="$t('oneTimeCompletion')" 
          :readonly="isReadOnly" 
          @change="handleOneTimeCompletion"
          class="mx-8"
          flat
        />
      </div>

      <div class="d-flex align-center child-flex">
        <v-switch
          v-model="timedActivity.allow"
          :label="$t('timedActivity')"
          :readonly="isReadOnly"
          @change="onTimedActivity"
          flat
        />
        <div v-if="timedActivity.allow" class="ds-timeout-body">
          <div class="ds-timeout-units">
            <v-text-field
              type="number"
              v-model="timedActivity.hour"
              @change="onChangeTimedHour"
              class="ds-schedule-timeout"
              single-line
              hide-details
              max="23"
              min="0"
              solo
              flat
            />
            <div class="ds-timeout-unit">{{ $t('hours') }}</div>
          </div>

          <div class="ds-timeout-units">
            <v-text-field
              type="number"
              v-model="timedActivity.minute"
              @change="onChangeTimedMinute"
              class="ds-schedule-timeout"
              single-line
              hide-details
              max="59"
              min="00"
              solo
              flat
            />
            <div class="ds-timeout-unit">{{ $t('minutes') }}</div>
          </div>
        </div>
      </div>

      <div class="d-flex align-baseline child-flex">
        <v-switch
          v-model="scheduledIdleTime.allow"
          :label="$t('idleTime')"
          :readonly="isReadOnly"
          :disabled="timedActivity.allow"
          @change="handleIdleTimeAccess"
          flat
        />

        <div v-if="scheduledIdleTime.allow" class="ds-timeout-body">
          <div class="ds-timeout-units">
            <v-text-field
                type="number"
                v-model="scheduledIdleTime.minute"
                :value="scheduledTimeoutDecimal.minute"
                @change="onChangeMinutes"
                class="ds-schedule-timeout"
                single-line
                hide-details
                max="59"
                min="00"
                solo
                flat
            />
            <div class="ds-timeout-unit">{{ $t('minutes') }}</div>
          </div>
        </div>

        <div v-if="isTimeoutValid === false" class="error">
          Idle Time invalid: Idle Time should be non-zero.
        </div>
      </div>
    </div>

    <div v-else class="mx-8">
      <div class="d-flex align-baseline" >
        <schedule-times 
          v-if="!eventAvailability"
          :scheduledTimeout="scheduledTimeout"
          :schedule="schedule"
          :read-only="readOnly"
        />
      </div>
      <div class="d-flex  align-baseline">
        <v-switch
          v-model="scheduledTimeout.access"
          :label="$t('accessBefore')"
          :readonly="isReadOnly"
          @change="handleAccess"
          flat
        />
      </div>

      <div class="d-flex align-baseline" >
        <v-switch
          v-model="activityRepeats"
          :label="$t('activityRepeats')"
          :readonly="isReadOnly"
          flat
          class="mr-6"
        />
        <v-row v-if="activityRepeats">
          <div :class="showRange ? 'ds-schedule-type-selected' : 'ds-schedule-type-select'" class="mr-4">
            <slot name="scheduleType" v-bind="{ schedule, day, setType, custom }">
              <schedule-type
                  :day="day"
                  :schedule="schedule"
                  :read-only="readOnly"
                  @change="setType"
                  @custom="custom"
              />
            </slot>
          </div>
        </v-row>
        <v-row v-if="activityRepeats">
          <div v-if="showRange" class="ds-schedule-span">
            <!-- Span -->
            <slot name="scheduleSpan" v-bind="{ schedule, day }">
              <schedule-span :schedule="schedule" :day="day" :read-only="readOnly" />
            </slot>
          </div>
        </v-row>
      </div>

      <div class="d-flex align-baseline child-flex">
        <v-switch
          v-model="timedActivity.allow"
          :label="$t('timedActivity')"
          :readonly="isReadOnly"
          @change="onTimedActivity"
          flat
        />
        <div v-if="timedActivity.allow" class="ds-timeout-body">
          <div class="ds-timeout-units">
            <v-text-field
              type="number"
              v-model="timedActivity.hour"
              @change="onChangeTimedHour"
              class="ds-schedule-timeout"
              single-line
              hide-details
              max="23"
              min="0"
              solo
              flat
            />
            <div class="ds-timeout-unit">{{ $t('hours') }}</div>
          </div>

          <div class="ds-timeout-units">
            <v-text-field
              type="number"
              v-model="timedActivity.minute"
              @change="onChangeTimedMinute"
              class="ds-schedule-timeout"
              single-line
              hide-details
              max="59"
              min="00"
              solo
              flat
            />
            <div class="ds-timeout-unit">{{ $t('minutes') }}</div>
          </div>
        </div>
      </div>

      <div class="d-flex align-baseline child-flex">
        <v-switch
          v-model="scheduledIdleTime.allow"
          :label="$t('idleTime')"
          :readonly="isReadOnly"
          :disabled="timedActivity.allow"
          @change="handleIdleTimeAccess"
          flat
        />

        <div v-if="scheduledIdleTime.allow" class="ds-timeout-body">
          <div class="ds-timeout-units">
            <v-text-field
                type="number"
                v-model="scheduledIdleTime.minute"
                :value="scheduledTimeoutDecimal.minute"
                @change="onChangeMinutes"
                class="ds-schedule-timeout"
                single-line
                hide-details
                max="59"
                min="00"
                solo
                flat
            />
            <div class="ds-timeout-unit">{{ $t('minutes') }}</div>
          </div>
        </div>

        <div v-if="isTimeoutValid === false" class="error">
          Idle Time invalid: Idle Time should be non-zero.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Day, Schedule } from "dayspan";
import ScheduleType from "./ScheduleType";
import ScheduleTimes from "./ScheduleTimes";
import ScheduleSpan from "./ScheduleSpan";
export default {
  name: "dsSchedule",
  components: {
    ScheduleType,
    ScheduleTimes,
    ScheduleSpan,
  },
  props: {
    schedule: {
      required: true,
      type: Schedule,
    },
    extendedTime: {
      required: false,
    },
    initialTimedActivity: {
      required: false,
    },
    timeout: {
      required: false,
    },
    onlyScheduledDay: {
      type: Boolean,
      required: false,
    },
    completion: {
      required: false,
    },
    idleTime: {
      required: false,
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
    allowsRange: {
      type: Boolean,
      default() {
        return this.$dsDefaults().allowsRange;
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isTimeoutValid: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  // eslint-disable-next-line
  data() {
    return {
      activityRepeats: !!this.schedule.isSingleEvent(),
      eventAvailability: this.availability,
      oneTimeCompletion: this.completion,
      timedActivity: this.initialTimedActivity,
      scheduledTimeout: this.timeout,
      scheduledDay: this.onlyScheduledDay,
      scheduledTimeoutDecimal: this.timeout,
      scheduledExtendedTime: this.extendedTime,
      scheduledExtendedTimeDecimal: this.extendedTime,
      scheduledIdleTime: this.idleTime,
    };
  },
  computed: {
    showRange() {
      return this.allowsRange && !this.schedule.isSingleEvent();
    },
    classes() {
      return {
        "ds-schedule-small": this.$vuetify.breakpoint.smAndDown,
      };
    },
    isReadOnly() {
      return this.readOnly || this.$dayspan.readOnly;
    },
  },
  watch: {
    timeout: function(newTimeout) {
      scheduledTimeout = newTimeout;
    },
  },
  methods: {
    custom() {
      this.$refs.customScheduler.edit(this.schedule, this.day);
    },
    handleAccess() {
      this.$emit("onTimeout", this.scheduledTimeout);
    },
    handleTimedActivity() {
      this.$emit("onTimedActivity", this.timedActivity);
    },
    handleScheduledDay() {
      this.$emit("onScheduledDay", this.scheduledDay);
    },
    handleOneTimeCompletion() {
      this.$emit("onCompletion", this.oneTimeCompletion);
    },
    handleIdleTimeAccess() {
      this.$emit("onIdleTime", this.scheduledIdleTime);
    },
    handleExtendedTimeAccess() {
      this.$emit("onExtendedTime", this.scheduledExtendedTime);
    },
    setType(type) {
      this.$emit("type", type);
    },
    onTimedActivity() {
      if (this.timedActivity.allow) {
        this.scheduledExtendedTime.allow = false;
        this.scheduledIdleTime.allow = false;

        this.handleExtendedTimeAccess();
        this.handleIdleTimeAccess();
        this.handleAccess();
      }
      this.handleTimedActivity();
    },
    onChangeExtendedDays(newVal) {
      // Convert to integer
      this.scheduledExtendedTimeDecimal.days = Math.round(newVal);
      // Hours value must be between 0 and 59, inclusive
      if (this.scheduledExtendedTimeDecimal.days < 0) {
        this.scheduledExtendedTimeDecimal.days = 0;
      } else if (this.scheduledExtendedTimeDecimal.days > 31) {
        this.scheduledExtendedTimeDecimal.days = 31;
      }
      this.scheduledExtendedTime.days = this.scheduledExtendedTimeDecimal.days;
      // Emit updated form
      this.handleExtendedTimeAccess();
    },
    onChangeTimedHour(newVal) {
      this.timedActivity.hour = newVal < 0 ? 0 : Math.round(newVal);
      this.handleTimedActivity();
    },

    onChangeTimedMinute(newVal) {
      this.timedActivity.minute = newVal < 0 ? 0 : Math.round(newVal);
      this.handleTimedActivity();
    },

    onChangeTimedSecond(newVal) {
      this.timedActivity.second = newVal < 0 ? 0 : Math.round(newVal);
      this.handleTimedActivity();
    },
    onChangeDays(newVal) {
      // Convert to integer
      this.scheduledTimeoutDecimal.day = Math.round(newVal);
      // Days value must be at lest 0
      if (this.scheduledTimeoutDecimal.day < 0) {
        this.scheduledTimeoutDecimal.day = 0;
      }
      this.scheduledTimeout.day = this.scheduledTimeoutDecimal.day;
      // Emit updated form
      this.handleAccess();
    },
    onChangeHours(newVal) {
      // Convert to integer
      this.scheduledTimeoutDecimal.hour = Math.round(newVal);
      // Hours value must be between 0 and 23, inclusive
      if (this.scheduledTimeoutDecimal.hour < 0) {
        this.scheduledTimeoutDecimal.hour = 0;
      } else if (this.scheduledTimeoutDecimal.hour > 23) {
        this.scheduledTimeoutDecimal.hour = 23;
      }
      this.scheduledTimeout.hour = this.scheduledTimeoutDecimal.hour;
      // Emit updated form
      this.handleAccess();
    },
    onChangeMinutes(newVal) {
      // Convert to integer
      this.scheduledTimeoutDecimal.minute = Math.round(newVal);
      // Hours value must be between 0 and 59, inclusive
      if (this.scheduledTimeoutDecimal.minute < 0) {
        this.scheduledTimeoutDecimal.minute = 0;
      } else if (this.scheduledTimeoutDecimal.minute > 59) {
        this.scheduledTimeoutDecimal.minute = 59;
      }
      this.scheduledTimeout.minute = this.scheduledTimeoutDecimal.minute;
      // Emit updated form
      this.handleAccess();
    },
  },
};
</script>

<style lang="scss">
.ds-schedule {
  .ds-schedule-type-select {
    width: 180px;
    height: 42px;
  }
  .ds-schedule-type-selected {
    width: 160px;
    height: 42px;
  }
  &.ds-schedule-small {
    .ds-schedule-type {
      width: 100%;
    }
  }
  .ds-timeout-units {
    display: flex;
    margin-right: 5%;
  }
  .ds-schedule-timeout {
    width: 70px;
    margin-right: 0%;
  }
  .ds-timeout-body {
    display: flex;
  }
  .ds-timeout-unit {
    line-height: 48px;
  }
  .ds-notif-ele {
    height: 40px;
  }
  .ds-reminder-time {
    max-width: 125px;
    margin: 0 0 0 10px;
    padding: 0;
  }
  .v-text-field__slot {
    border-bottom: 1px solid grey;
  }
  .v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
  }
  .v-input input {
    text-align: center;
  }
  .v-messages {
    min-height: 10px;
  }

  .d-flex {
    display: flex;
    align-items: center !important;

  }
  .col {
    padding: 0 !important;
  }
}
</style>