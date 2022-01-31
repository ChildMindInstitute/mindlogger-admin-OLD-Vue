<template>
  <div
    class="my-4 wrapper"
    :class="`_${unit}-view`"
    @click="backToOriginalView"
  >
    <DateRangePicker
      :start-date="startDate"
      :end-date="endDate"
      :minimum-date="minimumDate"
      :unit="unit"
      :range="range"
      :center="baseLine"
      @viewDetails="$emit('viewDetails', $event)"
    />

    <div
      class="matrix-chart"
    >
      <v-card
        class="tooltip"
        :style="`display: ${tooltip.visible ? 'block' : 'none'}; left: ${tooltip.left}px; top: ${tooltip.top}px;`"
      >
        <div class="tooltip-item">
          <div class="label frequency">Frequency:</div>
          <div>{{ tooltip.frequency }}</div>
        </div>

        <div class="tooltip-item">
          <div class="label distress">Distress:</div>
          <div>{{ tooltip.distress }}</div>
        </div>

        <div class="tooltip-item">
          <div class="label impairment">Impairment:</div>
          <div>{{ tooltip.impairment }}</div>
        </div>
      </v-card>

      <svg
        :id="`matrix-${plotId}`"
        :width="width"
        :height="height + padding.top + padding.bottom"
      >
        <g
          class="content"
        >
          <g
            :class="`${unit == 'hour' ? 'selectable' : ''} x-axis`"
          >
            <text
              v-for="(freq, index) in data.frequency"
              :key="index"
              :x="xUnit * (index+0.5)"
              :y="baseLine - 5"
              :class="unit == 'day' && freq.start.getDay() < 2 ? 'bold-text' : ''"
              @click.stop="viewDetails(freq)"
            >
                <tspan text-anchor="middle">{{ getWeekDay(freq.start) }}</tspan>
                <tspan text-anchor="middle" :x="xUnit * (index+0.5)" dy="1.2em">{{ xTick(freq.start) }}</tspan>
            </text>
          </g>
          <g
            v-if="unit == 'day'"
            class="lines"
          >
            <template
              v-for="(freq, index) in data.frequency"
            >
              <rect
                v-if="freq.start.getDay() == 1"
                :key="index"
                :x="xUnit*index - 1"
                :y="0"
                :width="2"
                :height="height"
                fill="rgb(207, 207, 207)"
              />
            </template>

            <rect
              v-if="data.frequency[data.frequency.length-1].end.getDay() == 1"
              :x="xUnit*data.frequency.length-1"
              :y="0"
              :width="2"
              :height="height"
              fill="rgb(207, 207, 207)"
            />
          </g>
          <g class="responses">
            <g
              v-for="(feature) in features"
              :key="feature.slug"
              :class="feature.slug"
            />
          </g>
        </g>

        <g
          class="labels"
          :transform="`translate(${width - labelWidth}, 0)`"
        >
          <text
            v-for="(feature, index) in features"
            :key="feature.slug"
            :y="padding.top + heightPerFeature * (index + (feature.value < 0 ? 1 : 0)) + 11"
            :x="10"
            :font-size="15"
          >
            {{ compressedName(feature.name.en) }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
}

.tooltip {
  z-index: 9999;
  position: absolute;
  max-width: 300px;
  font-size: 14px;
  flex-wrap: wrap;
  padding: 15px;
  transform: translateY(-50%);

  .tooltip-item {
    display: flex;

    .label {
      width: 100px;
      font-weight: bold;
    }

    .frequency {
      color: blue;
    }

    .distress {
      color: rgb(236, 6, 142);
    }

    .impairment {
      color: rgb(21, 180, 237)
    }
  }
}

.matrix-chart {
  position: relative;
}

._5mins-view {
  cursor: pointer;
}

svg {
  text {
    line-height: 22.5px;
  }

  .x-axis text {
    font-size: 11px;
  }
  .x-axis text.bold-text {
    font-weight: bold;
  }

  .x-axis.selectable text {
    cursor: pointer;

    &:hover {
      fill: grey;
    }
  }
}

</style>

<script>
import { ChartMixin } from  '../../Utils/mixins/ChartMixin';
import * as d3 from 'd3';
import * as moment from 'moment';
import DateRangePicker from './DateRangePicker';

export default {
  mixins: [ChartMixin],
  components: {
    DateRangePicker
  },
  data() {
    const heightPerFeature = 32;

    return {
      heightPerFeature,
      height: heightPerFeature * (this.features.length + 1),
      tooltip: {
        frequency: 0,
        distress: 0,
        impairment: 0,
        visible: false,
        left: 0,
        top: 0,
      }
    }
  },

  watch: {
    width () {
      this.render();
    },

    dateRange () {
      this.render();
    },
  },

  mounted () {
    this.$nextTick(() => {
      this.render();
    });
  },

  computed: {
    baseLine () {
      return this.padding.top + this.heightPerFeature * (this.positiveOptions.length) + 11
    },

    dateRange () {
      return `${this.startDate.getTime()}-${this.endDate.getTime()}`;
    },

    radius () {
      const r = Math.min(this.heightPerFeature/2, this.xUnit/2) - 6;
      if (r < 6) {
        return 6;
      }

      return r;
    }
  },

  methods: {
    render () {
      const svg = d3.select(`#matrix-${this.plotId}`)

      for (let i = 0; i < this.features.length; i++) {
        const feature = this.features[i];

        svg
          .select(`.responses .${feature.slug}`)
          .selectAll('*')
          .remove();

        for (let j = 0; j < this.data.frequency.length; j++) {
          const x = this.xUnit * (j+0.5)
          const y = this.heightPerFeature * (i + (feature.value < 0 ? 1 : 0)) + this.padding.top + this.radius;

          const freq = this.data.frequency[j][feature.id] || 0;
          const total = this.data.total[j];
          const distress = this.data.distress[j][feature.id] || 0;
          const impairment = this.data.impairment[j][feature.id] || 0;

          svg
            .select(`.responses .${feature.slug}`)
            .append('circle')
            .attr('fill', total ? feature.color : '#EFEFEF')
            .attr('fill-opacity', total ? freq / this.maxFrequency : 1)
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', this.radius)
            .attr('stroke', 'rgb(44, 82, 141)')
            .attr('stroke-width', 1)
            .on('mouseover', () => {
              this.tooltip = {
                frequency: freq,
                distress,
                impairment,
                visible: true,
                left: this.xUnit * (j+1),
                top: y
              }
            })
            .on('mouseout', () => this.$set(this.tooltip, 'visible', false))
        }
      }
    }
  }
}
</script>
