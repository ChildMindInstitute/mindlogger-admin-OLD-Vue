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
        <v-checkbox
          v-model="schedule.relative"
          label="relative to first response"
        >
          <template slot="label">
            <div>
              Relative to first response
              <p>
                <small>
                  if this is selected, all dates and times entered below
                  will be relative to when the user first responds
                </small>
              </p>
            </div>
          </template>
        </v-checkbox>

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
            v-model="access"
            @change="onAccess"
            label="Allow access before scheduled time"
          />
          <!-- <label>-- {{ access }} </label> -->
          <label v-if="!access">Timeout : </label>

          <div class="ds-timeout-body" v-if="!access">
            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.day"
                class="ds-schedule-timeout"
                single-line
                hide-details
                solo
                flat
              />
              <div class="ds-timeout-unit"> days </div>
            </div>

            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.hour"
                class="ds-schedule-timeout"
                single-line
                hide-details
                solo
                flat
              />
              <div class="ds-timeout-unit"> hours </div>
            </div>

            <div class="ds-timeout-units">
              <v-text-field
                type="number"
                v-model="timeout.minute"
                class="ds-schedule-timeout"
                single-line
                hide-details
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
          <ds-schedule-times
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

export default {

  name: 'dsSchedule',
  components: {
    ScheduleType
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
      access: this.timeout.access,
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

    onAccess() {
    },

    setType(type) {
      this.$emit('type', type);
    }
  },
  
  watch:
  {
  }
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

  .v-input input {
    text-align: center;
  }
}

</style>
