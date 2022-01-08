<template>
  <div
    class="my-4"
  >
    <div
      class="wrapper"
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
        :class="`${viewType}-chart`"
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
          :id="`area-bar-${plotId}`"
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
                :y="baseLine"
                :class="unit == 'day' && freq.start.getDay() < 2 ? 'bold-text' : ''"
                text-anchor="middle"
                @click.stop="viewDetails(freq)"
              >
                {{ xTick(freq.start) }}
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
              <g class="negative-values" />
              <g class="positive-values" />
            </g>
          </g>

          <foreignObject
            class="labels"
            :x="width - labelWidth"
            :y="padding.top"
            :width="labelWidth"
            :height="height"
          >
            <div
              class="chart-labels"
              :style="`max-height: ${height-20}px;`"
            >
              <template
                v-for="feature of features"
              >
                <div
                  v-if="!selectedFeature || selectedFeature.id == feature.id"
                  :key="feature.id"
                  class="feature"
                  @click.stop="$emit('selectFeature', feature)"
                >
                  <div
                    class="feature-title"
                  >
                    {{ compressedName(feature.name.en) }}
                  </div>
                  <div
                    class="feature-color"
                    :style="{ background: feature.color }"
                  />
                </div>
              </template>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>

    <div
      v-if="format == 'export'"
    >
      <div class="export-features" :style="`width: ${viewWidth + 80}px;`">
        <template v-for="feature of features">
          <div
            v-if="!selectedFeature || selectedFeature.id == feature.id"
            :key="feature.id"
            class="feature"
          >
            <div class="feature-title">{{ compressedName(feature.name.en) }}</div>
            <div class="feature-color" :style="{ background: feature.color }" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
}

._5mins-view {
  cursor: pointer;
}

.bar-chart, .area-chart {
  position: relative;
}

.chart-labels {
  position: relative;
  overflow-y: auto;
  top: 50%;
  transform: translate(0, -50%);
}

.export-features {
  display: flex;
  flex-wrap: wrap;

  .feature {
    width: 31%;
  }
}

.feature {
  padding: 10px 20px;
  font-size: 14px;
  display: flex;
  cursor: pointer;

  .feature-title {
    width: 70%;
    text-align: center;
  }

  .feature-color {
    width: 30%;
    border-radius: 5px;
    border: 2px solid grey;
  }
}

.feature:hover {
  border: 2px solid grey;
  border-radius: 5px;
}

svg {
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

</style>

<style scoped>
svg /deep/ .selectable {
  cursor: pointer !important;
}

svg /deep/ .selectable:hover {
  opacity: 0.8;
}
</style>

<script>
import { ChartMixin } from  '../../Utils/mixins/ChartMixin';
import DateRangePicker from './DateRangePicker';
import * as d3 from 'd3';

export default {
  mixins: [ChartMixin],
  components: {
    DateRangePicker
  },

  data() {
    return {
      height: 500,
      axisHeight: 40,

      tooltip: {
        frequency: 0,
        distress: 0,
        impairment: 0,
        visible: false,
        left: 0,
        top: 0,
      },
    }
  },

  watch: {
    width () {
      this.render();
    },

    dateRange () {
      this.render();
    },

    selectedFeature () {
      this.render();
    },

    viewType () {
      this.render();
    }
  },

  computed: {
    dateRange () {
      return `${this.startDate.getTime()}-${this.endDate.getTime()}`;
    },

    baseLine () {
      return this.height / 2;
    },

    heightPerFreq () {
      const scale = this.yScale;

      const hf = Math.min(
        (this.height - this.axisHeight) / 2 / (scale[1] || 1),
        -(this.height - this.axisHeight) / 2 / (scale[0] || 1)
      );

      return Math.min(hf, 40);
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.render();
    });
  },

  methods: {
    render () {
      const svg = d3.select(`#area-bar-${this.plotId}`);

      let { positiveOptions, negativeOptions } = this;

      if (this.selectedFeature) {
        if (this.selectedFeature.value > 0) {
          positiveOptions = [this.selectedFeature];
        } else {
          negativeOptions = [this.selectedFeature];
        }
      }

      const positive = d3.stack().keys(positiveOptions.map(feature => feature.id))(this.data.frequency);
      const negative = d3.stack().keys(negativeOptions.map(feature => feature.id))(this.data.frequency);

      svg
        .select('.responses .positive-values')
        .selectAll('*')
        .remove();

      svg
        .select('.responses .negative-values')
        .selectAll('*')
        .remove();

      if (this.viewType == 'bar') {
        this.renderBarChart(svg, positive, negative);
      } else {
        this.renderAreaChart(svg, positive, negative);
      }
    },

    clickArea (d) {
      if (!this.selectedFeature) {
        const feature = this.features.find(f => d.key === f.id);
        this.$emit('selectFeature', feature);
      }
    },

    renderAreaChart (svg, positive, negative) {
      if (!this.selectedFeature || this.selectedFeature.value > 0) {
        svg
          .select('.responses .positive-values')
          .selectAll('polygon')
          .data(positive)
          .join('polygon')
          .attr('class', !this.selectedFeature ? 'selectable' : '')
          .attr('fill', layer => {
            return this.features.find(f => layer.key === f.id).color
          })
          .attr('points', layer => {
            const points = [[], []];

            for (let i = 0; i < layer.length; i++) {
              const d = layer[i];
              for (let j = 0; j < 2; j++) {
                points[j].push({
                  x: this.xUnit * (i + 0.5),
                  y: this.baseLine - this.axisHeight/2 - d[j] * this.heightPerFreq
                })
              }
            }
            return points[0]
                    .concat(points[1].reverse())
                    .map(point => `${point.x}, ${point.y}`)
                    .join(' ')
          })
          .on('mouseup', layer => this.clickArea(layer))
      }

      if (!this.selectedFeature || this.selectedFeature.value < 0) {
        svg
          .select('.responses .negative-values')
          .selectAll('polygon')
          .data(negative)
          .join('polygon')
          .attr('class', !this.selectedFeature ? 'selectable' : '')
          .attr('fill', layer => {
            return this.features.find(f => layer.key === f.id).color
          })
          .attr('points', layer => {
            const points = [[], []];

            for (let i = 0; i < layer.length; i++) {
              const d = layer[i];
              for (let j = 0; j < 2; j++) {
                points[j].push({
                  x: this.xUnit * (i + 0.5),
                  y: this.baseLine + this.axisHeight/2 + d[j] * this.heightPerFreq
                })
              }
            }
            return points[0]
                    .concat(points[1].reverse())
                    .map(point => `${point.x}, ${point.y}`)
                    .join(' ')
          })
          .on('mouseup', layer => this.clickArea(layer))
      }
    },

    renderBarChart (svg, positive, negative) {
      const component = this;

      if (!this.selectedFeature || this.selectedFeature.value > 0) {
        svg
          .select('.responses .positive-values')
          .selectAll('.layer')
          .data(positive)
          .join(group => group.insert('g'))
          .attr('class', 'layer')
          .attr('fill', layer => {
            return this.features.find(f => layer.key === f.id).color
          })
          .selectAll('rect')
          .data(layer => {
            layer.forEach(d => {
              d.key = layer.key;
              return d;
            });
            return layer;
          })
          .join('rect')
          .attr('class', !this.selectedFeature ? 'selectable' : '')
          .attr('x', (d, index) => {
            return this.xUnit * index;
          })
          .attr('y', d => {
            return this.baseLine - this.axisHeight/2 - d[1] * this.heightPerFreq;
          })
          .attr('width', this.xUnit)
          .attr('height', d => {
            return (d[1] - d[0]) * this.heightPerFreq
          })
          .on('mouseover', (d, index) => {
            this.tooltip = {
              frequency: this.data.frequency[index][d.key],
              distress: this.data.distress[index][d.key],
              impairment: this.data.impairment[index][d.key],
              visible: true,
              left: this.xUnit * (index + 1) + 10,
              top: this.baseLine - this.axisHeight/2 - (d[1]+d[0])/2 * this.heightPerFreq
            }
          })
          .on('mouseout', () => {
            this.$set(this.tooltip, 'visible', false)
          })
          .on('mouseup', d => this.clickArea(d))
      }

      if (!this.selectedFeature || this.selectedFeature.value < 0) {
        svg
          .select('.responses .negative-values')
          .selectAll('.layer')
          .data(negative)
          .join(group => group.insert('g'))
          .attr('class', 'layer')
          .attr('fill', layer => {
            return this.features.find(f => layer.key === f.id).color
          })
          .selectAll('rect')
          .data(layer => {
            layer.forEach(d => {
              d.key = layer.key;
              return d;
            });
            return layer;
          })
          .join('rect')
          .attr('class', !this.selectedFeature ? 'selectable' : '')
          .attr('x', (d, index) => {
            return this.xUnit * index;
          })
          .attr('y', d => {
            return this.baseLine + this.axisHeight/2 + d[0] * this.heightPerFreq;
          })
          .attr('width', this.xUnit)
          .attr('height', d => {
            return (d[1] - d[0]) * this.heightPerFreq
          })
          .on('mouseover', (d, index) => {
            this.tooltip = {
              frequency: this.data.frequency[index][d.key],
              distress: this.data.distress[index][d.key],
              impairment: this.data.impairment[index][d.key],
              visible: true,
              left: this.xUnit * (index + 1) + 10,
              top: this.baseLine + this.axisHeight/2 + (d[1]+d[0])/2 * this.heightPerFreq
            }
          })
          .on('mouseout', () => {
            this.$set(this.tooltip, 'visible', false)
          })
          .on('mouseup', d => this.clickArea(d))
      }
    }
  }
}
</script>
