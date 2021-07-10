<template>
  <div
    class="slider"
  >
    <input
      type="range"
      :class="isNull ? 'no-value' : ''"
      :min="minValue"
      :max="maxValue"
      v-model="response"
      step="0.1"
      @input="update"
      :disabled="disabled"
    />

    <div
      v-if="!item.showTickMarks"
      class="ticks"
    >
      <span
        v-for="tick in ticksLabels"
        :key="tick"
        class="tick"
      >{{ tick }}</span>
    </div>

    <div class="slider-description">
      <div
        class="first"
        :style="`width: ${tickWidth}%`"
      >
        <img
          :src="item.minValueImg"
          width="100%"
        />

        <div
          class="min-label"
        >
          {{ item.minValue }}
        </div>
      </div>
      <div
        class="last"
        :style="`width: ${tickWidth}%`"
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

.slider .ticks {
    display: flex;
    justify-content: space-between;
    padding: 5px;
}

.slider .ticks .tick {
    height: 10px;
    width: 1px;
    background: black;
    display: flex;
    justify-content: center;
    line-height: 40px;
}

.slider input[type="range"] {
    width: 100%;
    height: 2px;
}


input[type="range"].no-value::-webkit-slider-thumb {
    opacity: 0;
}

input[type="range"].no-value::-moz-range-thumb {
    opacity: 0;
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
    tickWidth () {
      return Math.floor(90 / (this.maxValue - this.minValue))
    }
  },

  methods: {
    update () {
      if (!this.item.isContinuousSlider) {
        this.response = Math.round(this.response)
      }

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
