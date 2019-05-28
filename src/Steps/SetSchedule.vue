<template>
  <div>
    <div v-if="scheduleType === 'absolute'">
      <Calendar :activities="activities"/>
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
    colors: ["Red", "Pink", "Purple", "Deep Purple", "Indigo", "Blue", "Glue",
    "Light Blue", "Cyan", "Teal", "Green", "Light Green", "Lime",
    "Yellow", "Amber", "Orange", "Deep Orange", "Brown", "Blue Gray",
    "Gray", "Black"],
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
    }
  },
  methods: {
    continueAction() {

    },
  }
}
</script>