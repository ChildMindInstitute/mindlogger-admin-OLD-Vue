<template>
  <div
    class="ds-schedule"
    :class="classes"
  >
    <div
      v-if="showRange"
      class="ds-schedule-span"
    >
      <!-- Span -->

      <slot
        name="scheduleSpan"
        v-bind="{schedule, day}"
      >
        <ds-schedule-span
          :schedule="schedule"
          :day="day"
          :read-only="readOnly"
        />
      </slot>
    </div>


    <div class="ds-schedule-type-line">
      <div class="ds-schedule-type">
        <!-- Type -->
        <slot
          name="scheduleType"
          v-bind="{schedule, day, setType, custom}"
        >
          <schedule-type
            :day="day"
            :schedule="schedule"
            :read-only="readOnly"
            @change="setType"
            @custom="custom"
          />
        </slot>

        <div class="ds-time-cell">
          <v-checkbox
            v-model="scheduledTimeout.access"
            @change="handleAccess"
            label="Allow access before scheduled time"
          />

          <v-checkbox
            v-model="scheduledTimeout.allow"
            @change="handleAccess"
            label="Allow timeout"
          />
          <!-- <label>-- {{ access }} </label> -->
          <label v-if="scheduledTimeout.allow">Timeout : </label>

          <div v-if="scheduledTimeout.allow" class="ds-timeout-body">
            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.day"
                @change="handleAccess"
                class="ds-schedule-timeout"
                single-line
                hide-details
                max="30"
                min="0"
                solo
                flat
              />
              <div class="ds-timeout-unit"> days </div>
            </div>

            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.hour"
                @change="handleAccess"
                class="ds-schedule-timeout"
                single-line
                hide-details
                max="23"
                min="00"
                solo
                flat
              />
              <div class="ds-timeout-unit"> hours </div>
            </div>

            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.minute"
                @change="handleAccess"
                class="ds-schedule-timeout"
                single-line
                hide-details
                max="59"
                min="00"
                solo
                flat
              />
              <div class="ds-timeout-unit"> minutes </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <v-layout
      row
      wrap
    >
      <v-flex xs12>
        <!-- Times -->
        <slot
          name="scheduleTimes"
          v-bind="{schedule, day}"
        >
          <schedule-times
            :schedule="schedule"
            :read-only="readOnly"
          />
        </slot>
      </v-flex>
      <v-flex
        v-if="!isReadOnly"
        xs12
      >
        <slot
          name="scheduleFooter"
          v-bind="{schedule, day}"
        />

        <!-- Custom -->
        <ds-schedule-type-custom-dialog
          ref="customScheduler"
          v-bind="{$scopedSlots}"
        />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { Day, Schedule } from 'dayspan';
import ScheduleType from './ScheduleType';
import ScheduleTimes from './ScheduleTimes';

export default {

  name: 'dsSchedule',
  components: {
    ScheduleType,
    ScheduleTimes,
  },
  props:
  {
    schedule:
    {
      required: true,
      type: Schedule
    },

    timeout: {
      required: false,
    },

    day:
    {
      type: Day
    },

    readOnly:
    {
      type: Boolean,
      default: false
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

    allowsRange:
    {
      type: Boolean,
      default() {
        return this.$dsDefaults().allowsRange;
      }
    }
  },

  // eslint-disable-next-line
  data() {
    return {
      scheduledTimeout: this.timeout
    }
  },
  computed:
  {
    showRange()
    {
      return this.allowsRange && !this.schedule.isSingleEvent();
    },

    classes()
    {
      return {
        'ds-schedule-small': this.$vuetify.breakpoint.smAndDown
      };
    },

    isReadOnly()
    {
      return this.readOnly || this.$dayspan.readOnly;
    }
  },

  methods:
  {
    custom() {
      this.$refs.customScheduler.edit(this.schedule, this.day);
    },

    handleAccess() {
      this.$emit('onTimeout', this.scheduledTimeout);
    },

    setType(type) {
      this.$emit('type', type);
    }
  },
}
</script>

<style lang="scss">

.ds-schedule {

  .ds-schedule-type {
    display: flex;
    max-width: 100%;
    padding-right: 8px;
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
    width: 15%;
    margin-right: 0%;
  }

  .ds-time-cell {
    margin-left: 2%;
    width: 100%;
  }

  .ds-timeout-body {
    display: flex;
  }

  .ds-timeout-unit {
    line-height: 48px;
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
}

</style>
