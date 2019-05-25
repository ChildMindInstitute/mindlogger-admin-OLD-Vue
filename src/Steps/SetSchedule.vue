<template>
  <div>
    <div v-if="scheduleType === 'absolute'">
      <Calendar />
    </div>
    <div v-else-if="scheduleType === 'relative'">
      relative schedule here.
    </div>
    <div v-else>
      {{scheduleType}}
      {{$store.state.currentApplet.schedule.scheduleType}}
    </div>
  </div>
</template>

<script>
import Calendar from './CalendarMain';

export default {
  name: 'schedule',
  components: {
    Calendar,
  },
  data: () => ({

  }),
  computed: {
    scheduleType() {
      if (this.$store.state.currentApplet) {
        return this.$store.state.currentApplet.schedule.scheduleType;
      }
      return 'none';
    }
  }
}
</script>