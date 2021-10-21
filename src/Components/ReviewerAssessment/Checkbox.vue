<template>
  <div class="option-list">
    <Option
      v-for="(option, index) in options"
      v-model="response[index]"
      :key="option.id"
      :option="option"
      :isTokenItem="isTokenItem"
      :disabled="disabled"
      type="checkbox"
      @update="update"
    />
  </div>
</template>

<style scoped>

</style>

<script>
import Option from './Option';
export default {
  components: {
    Option
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
    const selections = this.value.value || [];

    return {
      response: this.item.responseOptions.map(option =>
        selections.includes(option.name.en) || selections.includes(option.value)
      ),
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
      const newResponse = {
        value: []
      }

      for (let i = 0; i < this.response.length; i++) {
        if (this.response[i]) {
          newResponse.value.push(
            this.isTokenItem ? this.options[i].name.en : this.options[i].value
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
