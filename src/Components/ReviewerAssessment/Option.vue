<template>
  <div
    class="option"
  >
    <div
      v-if="!option.image"
      class="option-image"
    />

    <v-tooltip
      v-if="option.description"
      bottom
    >
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          class="option-tooltip"
          v-bind="attrs"
          v-on="on"
        >
          mdi-help-circle-outline
        </v-icon>
      </template>
      <markdown :source="option.description" />
    </v-tooltip>

    <div
      v-else
      class="option-tooltip"
    />

    <img
      v-if="option.image"
      class="option-image"
      :src="option.image"
    >

    <v-radio
      v-if="type == 'radio'"
      :label="option.name.en"
      :value="isTokenItem ? option.name.en : option.value"
      :disabled="disabled"
    />
    <v-checkbox
      v-else
      v-model="checked"
      class="mt-0"
      :label="option.name.en"
      :disabled="disabled"
      hide-details
      @change="$emit('update')"
    />
  </div>
</template>

<style scoped>
.option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-image {
  height: 24px;
  min-width: 24px;
  margin-right: 5px;
}

.option-tooltip {
  height: 22px;
  min-width: 22px;
  margin-right: 2px;
}
</style>

<script>
import Markdown from "../Utils/Markdown";
export default {
  components: {
    Markdown
  },
  props: {
    option: {
      type: Object,
      required: true
    },
    isTokenItem: {
      type: Boolean,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    checked: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
