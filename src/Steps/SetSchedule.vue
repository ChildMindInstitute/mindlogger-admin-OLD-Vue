<template>
  <div>
    <div v-if="scheduleType === 'absolute'">
      <Calendar :activities="activities" ref="calendar"/>
    </div>
    <div v-else-if="scheduleType === 'relative'">
      relative schedule here.
    </div>
    <div v-else>
      {{scheduleType}}
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Calendar from './CalendarMain';
import adminApi from '../Custom/Utils/api';

export default {
  name: 'schedule',
  components: {
    Calendar,
  },
  data: () => ({
    scheduleType: 'absolute',
    colors: ["Orange",  "Deep Purple", "Red",
    "Light Blue","Pink","Glue", "Light Green",
    "Blue Gray", "Green", "Yellow", "Teal", "Brown", "Indigo",
    "Amber", "Cyan", "Gray", "Blue", "Purple", "Lime", "Deep Orange"],
    readyToContinue: true,
  }),
  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    activities() {
      if (this.currentApplet) {
        let index = 0;
        return _.map(this.currentApplet.activities, (a, URI) => { 
          const name = a['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value'];
          const color = this.colors[index]
          index += 1;
          return {
            name,
            color,
            visibility: 1,
            URI,
          };
        });
      }
      return [];
    },
    schedule() {
      if (this.currentApplet) {
        if (this.$store.state.currentApplet.applet.schedule) {
          return this.$store.state.currentApplet.applet.schedule;
        }
      }
    },
  },
  methods: {
    continueAction() {
      const scheduleForm = new FormData();
      const schedule = this.currentApplet.applet.schedule;
      scheduleForm.set('schedule', JSON.stringify(schedule));
      adminApi.setSchedule({
        apiHost: this.$store.state.backend,
        id: this.currentApplet.applet._id,
        token: this.$store.state.auth.authToken.token,
        data: scheduleForm,
      }).then(() => {
      });
    },
  }
}
</script>