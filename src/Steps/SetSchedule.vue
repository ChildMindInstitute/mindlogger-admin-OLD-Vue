<template>
  <div>
    <div v-if="scheduleType === 'absolute'">
      <Calendar />
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
    scheduleType: 'absolute',
  })
}
</script>