<template>
  <v-radio-group v-model="response">
    <div class="option-list">
      <v-radio
        class="option"
        v-for="n in 5"
        :key="n"
        :label="`Radio ${n}`"
        :value="n"
        :disabled="disabled"
      ></v-radio>
    </div>
  </v-radio-group>
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
