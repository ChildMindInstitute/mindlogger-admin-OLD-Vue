<template>
  <div>
    
    <hr style="margin-bottom: 1.5em; margin-top: 1.5em; height: 1px" />

    <div class="ds-notifications">
      <v-checkbox
        v-model="details.useNotifications"
        class="ds-notification-cell"
        :label="$t('turnOnNotifs')"
      />
      
      <v-checkbox 
        v-if="details.useNotifications"
        v-model="reminder.valid" 
        class="ds-notification-cell"
        :label="$t('reminderNotif')" 
      />

      <v-checkbox 
        v-if="details.useNotifications"
        v-model="allowRandom" 
        class="ds-notification-cell"
        :label="$t('randomNotif')" 
      />
    </div>

    <div v-if="details.useNotifications">
      <div
        v-for="(notification, index) in notificationTimes"
        :key="'notifi_' + index"
      >
        <!-- Start notification at -->
        <div class="ds-time-cell">
          <div class="ds-notification-row">
            <label>{{ $t("startNotifAt") }}</label>
            <div class="ds-notification-row">
              <v-btn 
                depressed 
                color="secondary" 
                class="ds-btn-cell"
                fab
                small 
                @click="add(index)"
              >
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

        <label class="ds-notification-row" v-if="allowRandom">
          {{ $t("randomizeEnds") }}
        </label>

        <v-text-field
          v-if="allowRandom"
          v-model="notification.end"
          :disabled="!notification.random"
          single-line
          hide-details
          solo
          text
          type="time"
        />
      </div>

      <div class="ds-reminder-container" v-if="reminder.valid">
        <div class="ds-reminder-label">{{ $t("reminder") }}</div>

        <div class="ds-reminder-flex">
          <label>If the user does not complete this activity after</label>
          <input type="number" class="ds-reminder-day" v-model="reminder.days" />
          <label>consecutive days, send a reminder notification</label>
        </div>

        <div class="ds-reminder-flex">
          <label> at </label>
          <v-text-field
            type="time"
            class="ds-reminder-time"
            v-model="reminder.time"
            single-line
            hide-details
            solo
            text
          />
        </div>
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
      }
    },
    allowRandom: function(val) {
      if (!this.notificationTimes.length) return;

      if (val) {
        this.notificationTimes.forEach(notification => {
          notification.random = true;
        });
      } else {
        this.notificationTimes.forEach(notification => {
          notification.random = false;
        });
      }
    }
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

<style scoped lang="scss">
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

.ds-reminder-label {
  margin-bottom: 10px;
}

.ds-reminder-flex {
  display: flex;
  align-items: center;
  font-size: 15px;
}

.ds-reminder-time {
  max-width: 125px;
  margin-left: 10px !important;
}

.ds-reminder-container {
  padding: 20px 5px 5px 5px;
}

.ds-reminder-day {
  margin: 0 7px;
  border-bottom: 1px solid grey;
  padding: 0;
  width: 35px;
  font-size: 16px;
  text-align: center;
}
</style>
