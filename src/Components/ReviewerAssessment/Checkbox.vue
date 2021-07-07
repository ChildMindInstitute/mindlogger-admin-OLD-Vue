<template>
  <div class="option-list">
    <v-checkbox
      class="option"
      v-for="n in 5"
      :key="n"
      hide-details
      :label="`Radio ${n}`"
      :disabled="disabled"
    />
  </div>
</template>

<style scoped>
.option-list {
  display: flex;
  flex-wrap: wrap;
}

.option {
  width: 33%;
}
</style>

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
      response: ''
    }
  }
}
</script>
