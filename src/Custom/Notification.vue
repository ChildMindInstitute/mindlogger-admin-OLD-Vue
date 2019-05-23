<template>
  <div>
    <v-checkbox label="turn on notifications"
      v-model="details.useNotifications"></v-checkbox>

    <div v-for="(notification, index) in notificationTimes"
    :key="'notifi_'+index" >

      <!-- Start notification at -->
      <div class="ds-time-cell">
        <hr style="margin-bottom: 1.5em; margin-top: 1.5em;">
        <label>start notification at</label>
        <v-text-field
          :disabled="!details.useNotifications"
          single-line hide-details solo flat
          type="time"
          v-model="notification.start"
        ></v-text-field>
      </div>

      <v-checkbox v-if="notification.start"
      :label="`only notify if activity hasn't been completed by ${notification.start}`"
      v-model="notification.notifyIfComplete"></v-checkbox>

      <v-checkbox label="random notifications"
        v-model="notification.random"></v-checkbox>

      <label>randomize ends at</label>
      <v-text-field
        :disabled="!details.randomNotifications"
        single-line hide-details solo flat
        type="time"
        v-model="notification.end"
      ></v-text-field>

      <v-btn depressed color="secondary" @click="add(index)" fab small>
        <v-icon dark>add</v-icon>
      </v-btn>
      <v-btn depressed color="secondary" @click="remove(index)" fab small v-if="index">
         <v-icon dark>remove</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'Notification',
  props: {
    details: {
      type: Object,
    },
  },
  data() {
    return {
      notificationTimes: [
      ],
      notificationItem: {
        start: null,
        end: null,
        random: false,
        notifyIfComplete: false,
      }
    };
  },

  watch: {
    notificationTimes: {
      deep: true,
      handler() {
        this.$emit('updatedNotification', this.notificationTimes);
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
    }
  },
  methods: {
    add(index) {
      const n = _.clone(this.notificationTimes);
      n.splice(index+1,0,_.clone(this.notificationItem));
      this.notificationTimes = n;
      this.$emit('updatedNotification', this.notificationTimes);
    },
    remove(i) {
      const n = _.clone(this.notificationTimes);
      n.splice(i, 1);
      this.notificationTimes = n;
      this.$emit('updatedNotification', this.notificationTimes);
    }
  },
}
</script>