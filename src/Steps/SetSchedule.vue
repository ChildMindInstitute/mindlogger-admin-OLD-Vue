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
    activities() {
      let index = 0;
      return _.map(this.$store.state.currentApplet.activities, (a) => { 
        const name = a['http://www.w3.org/2004/02/skos/core#prefLabel'][0]['@value'];
        const color = this.colors[index]
        index += 1;
        return {
          name,
          color,
          visibility: 1,
        };
      });
    },
    schedule() {
      if (this.$store.state.currentApplet.schedule) {
        return JSON.parse(this.$store.state.currentApplet.schedule);
      }
    },
  },
  methods: {
    continueAction() {
      console.log('calendar', this.$refs.calendar.calendar.events);
      // const str = JSON.stringify(this.$refs.calendar.calendar.events);
      // this.$store.commit('setSchedule', str);
    },
  }
}
</script>