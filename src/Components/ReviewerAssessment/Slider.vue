<template>
  <div
    class="slider"
  >
    <v-slider
      v-model="response"
      :max="maxValue"
      :min="minValue"
      :thumb-color="thumbColor"
      :tick-labels="ticksLabels"
      :disabled="disabled"
      step="1"
      tick-size="4"
      ticks="always"
      @input="update"
    />

    <div class="slider-description">
      <div
        class="first"
        :style="`width: ${Math.floor(90 / ticksLabels.length)}%`"
      >
        <img
          :src="item.minValueImg"
          width="100%"
        />

        <div
          class="min-label"
        >
          {{item.minValue}}
        </div>
      </div>
      <div
        class="last"
        :style="`width: ${Math.floor(90 / ticksLabels.length)}%`"
      >
        <img
          :src="item.maxValueImg"
          width="100%"
        />

        <div
          class="min-label"
        >
          {{item.maxValue}}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slider {
  width: 80%;
  margin: auto;
}
.slider-description {
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
}

.slider-description .min-label,
.slider-description .max-label
{
  text-align: center;
}

.slider-description .first {
  position: relative;
  transform: translateX(-50%);
}

.slider-description .last {
  position: relative;
  transform: translateX(50%);
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
    let minValue = null, maxValue = null;

    for (let option of this.item.responseOptions) {
      if (minValue === null || minValue > option.value) {
        minValue = option.value;
      }

      if (maxValue === null || maxValue < option.value) {
        maxValue = option.value;
      }
    }

    return {
      response: minValue,
      isNull: true,
      minValue,
      maxValue,
      ticksLabels: this.item.responseOptions.map(option => option.name.en),
    }
  },

  computed: {
    thumbColor () {
      if (this.isNull) {
        return 'rgba(0,0,0,0)';
      }
      return ''
    }
  },

  methods: {
    update () {
      const newResponse = {
        value: this.response
      }

      if ('edited' in this.value) {
        newResponse.edited = new Date().getTime()
      }

      this.isNull = false

      this.$emit('input', newResponse)
    }
  }
}
</script>
