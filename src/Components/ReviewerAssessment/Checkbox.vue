<template>
  <div class="option-list">
    <v-checkbox
      class="option"
      v-for="(option, index) in options"
      v-model="response[index]"
      :key="option.id"
      :label="option.name.en"
      :disabled="disabled"
      hide-details
      @change="update"
    />
  </div>
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
      response: this.item.responseOptions.map(() => false),
    }
  },
  computed: {
    options () {
      return this.item.responseOptions;
    },
    isTokenItem() {
      return this.item.isTokenItem;
    }
  },
  methods: {
    update () {
      const newResponse = {
        value: []
      }

      for (let i = 0; i < this.response.length; i++) {
        if (this.response[i]) {
          newResponse.value.push(
            this.isTokenItem ? this.options[i].value : this.options[i].name.en
          );
        }
      }

      if ('edited' in this.value) {
        newResponse.edited = new Date().getTime()
      }

      this.$emit('input', newResponse)
    }
  }
}
</script>
