<template>
  <div
    class="radio-slider"
    :class="`radio-slider-${plotId}`"
  >
    <div
      class="tooltip"
      style="display: none"
    />

    <svg
      :id="plotId"
      :width="width + 20"
      :height="height + padding.top + padding.bottom"
    >
      <g class="labels">
        <text
          v-for="feature in features"
          :key="feature.slug"
          :y="radius * 2 + padding.top + heightPerFeature * feature.index"
          :x="labelWidth/2"
          :font-size="15"
          text-anchor="middle"
        >
          {{ compressedName(feature.name.en) }}
        </text>
      </g>
      <g
        class="content"
        :transform="`translate(${labelWidth}, 0)`"
      >
        <g class="x-axis" />
        <g class="versions" />
        <g class="responses" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.radio-slider {
  display: inline-block;
  position: relative;
  width: calc(100% - 40px);
  user-select: none;
  margin: 0px 20px;
}

.tooltip {
  z-index: 9999;
  position: absolute;
  max-width: 300px;
  font-size: 12px;
}

</style>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import { DrawingMixin } from '../Utils/mixins/DrawingMixin';

export default {
  name: 'RadioSlider',
  mixins: [DrawingMixin],
  props: {
    plotId: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true
    },
  },
  data: function() {
    let margin = { left: 20, right: 60 };
    let heightPerFeature = 35;

    let { data, features } = this.item.getFormattedResponseData();

    let width = this.parentWidth - margin.left - margin.right;

    return {
      height: features.length * heightPerFeature,
      heightPerFeature,
      margin,
      width,
      labelWidth: width / 4,
      data,
      features: features.map((feature, index) => ({
        ...feature,
        index
      })),
    }
  },
  computed: {
    responseDates() {
      let responseDates = {};
      for (let response of this.data) {
        for (let feature of this.features) {
          if (response[feature.slug] !== undefined) {
            let dateStr = moment(response.date).format('MMM-DD, YYYY');

            responseDates[dateStr] = responseDates[dateStr] || {};
            responseDates[dateStr][feature.slug] = (responseDates[dateStr][feature.slug] || []).concat(response);
          }
        }
      }

      return responseDates;
    }
  },
  /**
   * Handlers to be executed each time a property changes its value.
   */
  watch: {
    focusExtent: {
      deep: true,
      handler() {
        this.render();
      }
    },
    selectedVersions: {
      deep: true,
      handler() {
        this.render();
      }
    },
    hasVersionBars: {
      deep: false,
      handler() {
        this.render();
      }
    },
    parentWidth: {
      deep: false,
      handler(newValue) {
        this.width = newValue - this.margin.left - this.margin.right;
        this.labelWidth = this.width / 4;

        this.render();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.render();
    });
  },
  methods: {
    render() {
      this.svg = d3.select('#' + this.plotId);

      this.drawAxes();

      this.drawVersions();
      this.drawResponses();
    },

    compressedName(name) {
      return name.length > 30
        ? name.slice(0, 26) + ' …'
        : name
    },

    drawAxes() {
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width - this.labelWidth]);

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(d3.timeDay);

      this.svg
        .select('.x-axis')
        .selectAll('.feature-axis')
        .remove();

      for (let i = 0; i < this.features.length; i++) {
        let feature = this.features[i];

        this.svg
          .select('.x-axis')
          .append('g')
          .attr('class', 'feature-axis')
          .style('stroke-width', 2)
          .attr('transform', d => `translate(0, ${this.radius + this.padding.top + this.heightPerFeature * i})`)
          .call(
            xAxis.tickFormat(d => i == this.features.length - 1 ? moment(d).format('MMM-D') : '')
          );
      }
    },

    drawResponses() {
      const tooltip = document.querySelector(`.radio-slider.radio-slider-${this.plotId} .tooltip`);

      this.svg
        .select('.responses')
        .selectAll('*')
        .remove();

      let prevX = -1, prevY = -1;

      for (let response of this.data) {
        let x = -1, y = -1;
        for (let feature of this.features) {
          if (response[feature.slug] !== undefined) {
            x = this.x(response.date);
            y = this.radius + this.padding.top + this.heightPerFeature * feature.index;

            if (x < 0) {
              continue;
            }

            this.svg
              .select('.responses')
              .append('circle')
              .attr('fill', this.color)
              .attr('cx', x)
              .attr('cy', y)
              .attr('r', this.radius)
              .on('mouseover', () => tooltip.style.display = 'flex')
              .on('mouseout', () => tooltip.style.display = 'none')
              .on('mousemove', () => {
                const x = this.x(response.date);
                const dateStr = moment(response.date).format('MMM-DD, YYYY');
                const y = this.radius + this.padding.top + this.heightPerFeature * feature.index;

                tooltip.style.left = (x + this.labelWidth) + 'px';
                tooltip.style.padding = '5px';
                tooltip.style.top = y + 'px';
                tooltip.style.color = 'red';

                let responseCount = this.responseDates[dateStr][feature.slug].length;
                tooltip.innerText = this.$t('numberOfTimes', { number: responseCount, suffix: responseCount > 1 ? 's' : '' });
              });
          }
        }

        if (this.item.multiChoiceStatusByVersion[response.version]) {
          x = y = -1;
        }

        if (x >= 0 && prevX >= 0) {
          let delta = this.radius + 2;
          let dx = x - prevX, 
              dy = y - prevY;

          let r = Math.sqrt(dx * dx + dy * dy);

          dx /= r, dy /= r;

          if (r >= this.radius * 2) {
            this.svg
              .select('.responses')
              .append('line')
              .attr('x1', prevX + dx * delta)
              .attr('y1', prevY + dy * delta)
              .attr('x2', x - dx * delta)
              .attr('y2', y - dy * delta)
              .attr('stroke', 'black')
          }
        }

        prevX = x;
        prevY = y;
      }
    },
  }
}
</script>
