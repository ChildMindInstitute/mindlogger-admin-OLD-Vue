<template>
  <v-radio-group
    v-model="response"
    @change="update"
  >
    <div class="option-list">
      <v-radio
        class="option"
        v-for="option in options"
        :key="option.id"
        :label="option.name.en"
        :value="isTokenItem ? option.name.en : option.value"
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
  width: 50%;
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
    },
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      response: this.value.value !== null ? this.value.value : null
    }
  },
  computed: {
    options () {
      return this.item.responseOptions;
    },
    isTokenItem () {
      return this.item.isTokenItem;
    }
  },
  methods: {
    update () {
      const newResponse = { value: this.response }

      if ('edited' in this.value) {
        newResponse.edited = new Date().getTime()
      }

      this.$emit('input', newResponse)
    }
  }
}
</script>
