<template>
  <div>
    <v-slider
      v-model="response"
      :max="3"
      step="1"
      tick-size="4"
      ticks="always"
      :tick-labels="ticksLabels"
      :disabled="disabled"
    ></v-slider>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      response: 0,
      ticksLabels: [
        '1',
        '2',
        '3',
        '4'
      ],
    }
  }
}
</script>
