<template>
  <div>
    
    <hr style="margin-bottom: 1.5em; margin-top: 1.5em; height: 1px" />

    <v-checkbox
      v-model="details.useNotifications"
      :label="$t('turnOnNotifs')"
    />

    <div v-if="details.useNotifications">
      <div
        v-for="(notification, index) in notificationTimes"
        :key="'notifi_' + index"
      >
        <!-- Start notification at -->
        <div class="ds-time-cell">
          <label>{{ $t("startNotifAt") }}</label>
          <v-text-field
            v-model="notification.start"
            :disabled="!details.useNotifications"
            single-line
            hide-details
            solo
            text
            type="time"
          />
        </div>

        <v-checkbox v-model="notification.random" :label="$t('randomNotif')" />

        <label>{{ $t("randomizeEnds") }}</label>
        <v-text-field
          v-model="notification.end"
          :disabled="!notification.random"
          single-line
          hide-details
          solo
          text
          type="time"
        />

        <v-btn depressed color="secondary" fab small @click="add(index)">
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          v-if="index"
          depressed
          color="secondary"
          fab
          small
          @click="remove(index)"
        >
          <v-icon dark>mdi-minus</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Notification",
  props: {
    details: {
      type: Object,
      default: function() {
        return {};
      },
    },
  },
  data() {
    return {
      notificationTimes: [],
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
  },

  created() {
    if (!this.notificationTimes.length) {
      this.notificationTimes.push(_.clone(this.notificationItem));
    }
  },
  mounted() {
    if (this.details.notifications) {
      this.notificationTimes = this.details.notifications;
    }
  },
  methods: {
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
  },
};
</script>
