<template>
  <div class="d-flex align-end">
      <div>
        <v-switch 
          :label="$t('activityStartTime')" 
          :readonly="isReadOnly" 
          v-model="allDay"
          flat
          @change="allowTimeout()"
        />
      </div>
     
      <div v-for="(time, index) in schedule.times" :key="index" class="ml-2">
        <schedule-time
          class="ds-time-cell double"
          :index="index"
          :scheduledTimeout="timeout"
          :show-add="isLastTime(index)"
          :show-remove="hasTimes"
          :value="schedule.times[index]"
          :key="index"
          :read-only="readOnly"
          @add="addTime"
          @update="updateTimeout"
          @remove="removeTime"
          @change="changeTime"
        ></schedule-time>
      </div>
  </div>
</template>

<script>
import { Time, Schedule, Functions as fn } from "dayspan";
import ScheduleTime from "./ScheduleTime";

export default {
  name: "dsScheduleTimes",
  components: {
    ScheduleTime,
  },
  props: {
    schedule: {
      required: true,
      type: Schedule,
    },
    scheduledTimeout: {
      required: true,
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
    defaultTime: {
      type: String,
      default() {
        return this.$dsDefaults().defaultTime;
      },
    },
  },
  computed: {
    durationOptions() {
      var singular = this.schedule.duration === 1;
      var duringDay = [
        {
          text: singular ? this.labels.minute : this.labels.minutes,
          value: $t("minutes"),
        },
        {
          text: singular ? this.labels.hour : this.labels.hours,
          value: $t("hours"),
        },
      ];
      var allDay = [
        { text: singular ? this.labels.day : this.labels.days, value: "days" },
        {
          text: singular ? this.labels.week : this.labels.weeks,
          value: $t("weeks"),
        },
        {
          text: singular ? this.labels.month : this.labels.months,
          value: $t("months"),
        },
      ];
      return this.allDay ? allDay : duringDay.concat(allDay);
    },
    hasTimes() {
      return this.schedule.times.length > 1;
    },
    isReadOnly() {
      return this.readOnly || this.$dayspan.readOnly;
    },
  },
  data: (vm) => ({
    allDay: false,
    timeout: vm.scheduledTimeout,
  }),
  watch: {
    schedule: {
      handler: "updateAllDay",
      immediate: true,
    },
    allDay: "updateScheduleAllDay",
  },
  methods: {
    updateAllDay() {
      this.allDay = this.schedule.isFullDay();
    },
    updateScheduleAllDay(allDay) {
      if (this.schedule.isFullDay() !== allDay) {
        this.schedule.setFullDay(allDay);
        this.triggerChange();
        //this.allDay = !allDay
      }
    },
    allowTimeout() {
      this.timeout.allow = !this.allDay;
      this.$emit("update", this.timeout);
    },
    updateTimeout(newTimeout) {
      this.timeout.hour = newTimeout.hour;
      this.timeout.minute = newTimeout.minute;

      this.$emit("updateTimeout", this.timeout);
    },
    changeTime(ev) {
      ev.schedule = this.schedule;
      ev.updated = false;
      this.$emit("update", ev);
      if (!ev.handled && ev.schedule) {
        ev.updated = ev.schedule.moveTime(ev.time, ev.next);
        ev.handled = true;
      }
      this.$emit("change", ev);
    },
    addTime(ev) {
      ev.time = Time.parse(this.defaultTime);
      ev.schedule = this.schedule;
      if (ev.time) {
        this.$emit("add", ev);
        if (!ev.handled && ev.schedule) {
          ev.schedule.times.push(ev.time);
          ev.handled = true;
        }
        this.$emit("change", ev);
      }
    },
    removeTime(ev) {
      this.$dayspan.getPermission("removeExistingTime", () => {
        ev.schedule = this.schedule;
        this.$emit("remove", ev);
        if (!ev.handled && ev.schedule && ev.time) {
          ev.handled = ev.schedule.removeTime(ev.time);
        }
        this.$emit("change", ev);
      });
    },
    isLastTime(index) {
      return index === this.schedule.times.length - 1;
    },
    triggerChange() {
      this.$emit("change", this.getEvent("change"));
    },
    getEvent(type, extra = {}) {
      return fn.extend(
        {
          type: type,
          schedule: this.schedule,
          handled: false,
          $vm: this,
          $element: this.$el,
        },
        extra
      );
    },
  },
};
</script>

<style scoped lang="scss"></style>
