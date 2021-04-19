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
        <v-col class="no-padding" col="10" sm="11">
          <div>
            <div class="d-flex align-center ds-notif-ele">
              <v-switch 
                :label="$t('startNotifAt')" 
                v-model="notification.allow"
                flat
                class="mx-2"
              />
              
              <v-text-field
                class="ds-reminder-time"
                v-model="notification.start"
                :disabled="!notification.allow"
                single-line
                hide-details
                text
                type="time"
              />
            </div>

            <div class="d-flex align-center ds-notif-ele">
              <v-switch 
                :label="$t('randomizeEnds')" 
                v-model="notification.random"
                flat
                class="mx-2"
              />

              <v-text-field
                class="ds-reminder-time"
                v-model="notification.end"
                :disabled="!notification.random"
                single-line
                hide-details
                text
                type="time"
              />
            </div>
          </div>
        </v-col>
        <v-col col="1">
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
            <input type="number" class="ds-reminder-day" v-model="reminder.days" />
            {{ $t("consecutiveDays") }}
          </label>
        </div>

        <div class="ds-reminder-flex">
          <v-text-field
            type="time"
            class="ds-reminder-time"
            v-model="reminder.time"
            single-line
            hide-details
            text
          />
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
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
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
</style>
