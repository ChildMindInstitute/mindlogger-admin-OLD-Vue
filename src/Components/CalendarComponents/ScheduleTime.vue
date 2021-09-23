<template>
  <div class="ds-time-row">
    <div class="ds-time-cell d-flex align-baseline  ">
      {{ $t("startTime") }}

      <vue-timepicker
        v-if="$browserDetect.isSafari"
        :disabled="isReadOnly"
        v-model="time"
        close-on-complete
        class="ml-2 mr-1"
      >
      </vue-timepicker>

      <v-text-field
        v-else
        single-line
        hide-details
        solo
        flat
        type="time"
        :readonly="isReadOnly"
        v-model="time"
      />
    </div>
    <div class="ds-time-cell d-flex align-baseline">
      {{ $t("endTime") }}

      <vue-timepicker
        v-if="$browserDetect.isSafari"
        :disabled="isReadOnly"
        v-model="endTime"
        close-on-complete
        class="ml-2"
      >
      </vue-timepicker>

      <v-text-field
        v-else
        single-line
        hide-details
        solo
        flat
        type="time"
        :readonly="isReadOnly"
        v-model="endTime"
      />
    </div>
  </div>
</template>

<script>
import { Time, Functions as fn } from "dayspan";
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";

export default {
  name: "dsScheduleTime",
  components: { VueTimepicker },
  props: {
    value: {
      required: true,
      type: Time,
    },
    scheduledTimeout: {
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      default() {
        return this.$dsDefaults().index;
      },
    },
    mutate: {
      type: Boolean,
      default() {
        return this.$dsDefaults().mutate;
      },
    },
    showAdd: {
      type: Boolean,
      default() {
        return this.$dsDefaults().showAdd;
      },
    },
    showRemove: {
      type: Boolean,
      default() {
        return this.$dsDefaults().showRemove;
      },
    },
    labels: {
      validate(x) {
        return this.$dsValidate(x, "labels");
      },
      default() {
        return this.$dsDefaults().labels;
      },
    },
    colors: {
      validate(x) {
        return this.$dsValidate(x, "colors");
      },
      default() {
        return this.$dsDefaults().colors;
      },
    },
    icons: {
      validate(x) {
        return this.$dsValidate(x, "icons");
      },
      default() {
        return this.$dsDefaults().icons;
      },
    },
  },
  data: (vm) => ({}),
  computed: {
    time: {
      get() {
        return this.value.format("HH:mm");
      },
      set(time) {
        const startTime = Time.parse(time);
        const endTime = Time.parse(this.endTime);

        let minute = endTime.minute - startTime.minute;
        let hour = endTime.hour - startTime.hour;

        if (minute < 0) {
          minute += 60;
          hour -= 1;
        }

        this.$emit("update", {minute, hour});
        this.setTime(time);
      },
    },
    endTime: {
      get() {
        const currentTime = Time.parse(this.time);
        currentTime.minute += this.scheduledTimeout.minute;
        currentTime.hour += this.scheduledTimeout.hour + Math.floor(currentTime.minute / 60);

        if (currentTime.hour >= 24) {
          currentTime.hour = 23;
          currentTime.minute = 59;
        }

        if (currentTime.hour < this.value.hour) {
          currentTime.hour = this.value.hour;
          currentTime.minute = this.value.minute;
        } else if (currentTime.hour === this.value.hour) {
          currentTime.minute = currentTime.minute < this.value.minute ? this.value.minute : currentTime.minute;
        }

        return currentTime.format("HH:mm");
      },
      set(time) {
        const newTime = Time.parse(time);
        let minute = newTime.minute - this.value.minute;
        let hour = newTime.hour - this.value.hour;

        if (minute < 0) {
          minute += 60;
          hour -= 1;
        }

        this.$emit("update", {minute, hour});
      }
    },
    isReadOnly() {
      return this.readOnly || this.$dayspan.readOnly;
    },
  },
  methods: {
    addTime() {
      this.$emit("add", this.getEvent("add"));
    },
    removeTime() {
      this.$emit("remove", this.getEvent("remove"));
    },
    setTime(time) {
      var parsed = Time.parse(time);
      if (parsed) {
        var ev = this.getEvent("change", { next: parsed });
        this.$emit("change", ev);
        if (!ev.handled) {
          if (ev.mutate) {
            ev.time.set(ev.next);
            parsed = ev.next;
          }
          this.$emit("input", parsed);
        }
      }
    },
    getEvent(type, extra = {}) {
      return fn.extend(
        {
          type: type,
          time: this.value,
          index: this.index,
          mutate: this.mutate,
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

<style scoped lang="scss">
.ds-time-row {
  display: flex;
  .ds-time-cell {
    margin-bottom: 6px;
    &:last-child {
      margin-right: -8px;
    }
  }
}
</style>
