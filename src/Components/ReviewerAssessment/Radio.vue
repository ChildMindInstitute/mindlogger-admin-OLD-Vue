<template>
  <v-radio-group
    v-model="response"
    @change="update"
  >
    <div class="option-list">
      <Option
        v-for="option in options"
        :key="option.id"
        :option="option"
        :isTokenItem="isTokenItem"
        :disabled="disabled"
        type="radio"
      />
    </div>
  </v-radio-group>
</template>

<style scoped>

</style>

<script>
import Option from './Option';

export default {
  components: {
    Option,
  },
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
