<template>
  <div
    v-if="visible"
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
          v-for="(feature, index) in features"
          :key="feature.slug"
          :y="radius * 2 + padding.top + heightPerFeature * index"
          :x="labelWidth/2"
          :font-size="15"
          text-anchor="middle"
        >
          {{ compressedName(feature.name.en) }}
          <title>{{ feature.name.en }}</title>
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
  <div
    v-else
    :style="`height: ${height + padding.top + padding.bottom}px;`"
  >
      <v-progress-circular
        class="d-block ma-auto mt-2"
        color="black"
        indeterminate
        :size="25"
      >
      </v-progress-circular>
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
  font-size: 14px;
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
    timeRange: {
      type: String,
      required: true,
    },
  },
  data: function() {
    let margin = { left: 20, right: 60 };
    let heightPerFeature = 35;

    let { data, features } = this.item.getFormattedResponseData();

    let width = this.parentWidth - margin.left - margin.right;

    features = features.map((feature, index) => ({ ...feature, index}));
    if (this.item.inputType == 'slider') {
      features = features.reverse();
    }

    return {
      height: features.length * heightPerFeature,
      heightPerFeature,
      margin,
      width,
      labelWidth: width / 4,
      data,
      features,
      visible: false,
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
    },
    secretIds: {
      deep: true,
      handler() {
        if (this.hasResponseIdentifier) {
          this.render();
        }
      }
    }
  },
  mounted() {
    if (('IntersectionObserver' in window)) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) {
          return;
        }

        if (!this.visible) {
          this.visible = true;
          this.$nextTick(() => {
            this.render();
          });
        }
      });

      observer.observe(this.$el);
    } else {
      this.visible = true;
    }

    this.$nextTick(() => {
      this.render();
    });
  },
  methods: {
    render() {
      if (this.visible) {
        this.svg = d3.select('#' + this.plotId);

        this.drawAxes();

        this.drawVersions();
        this.drawResponses();
      }
    },

    getTickType() {
      if (this.timeRange === "Daily") {
        return d3.timeDay.every(2);
      } else if (this.timeRange === "Weekly") {
        return d3.timeWeek;
      } else if (this.timeRange === "Monthly") {
        return d3.timeMonth;
      }
      return d3.timeDay;
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

      const tickType = this.getTickType();

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(tickType);

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
          .style('stroke-width', 1.2)
          .style('color', 'grey')
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

      for (let i = 0; i < this.data.length; i++) {
        let x = -1, y = -1;
        let response = this.data[i];

        if (response.date < this.focusExtent[0]) {
          continue;
        }

        if (response.date > this.focusExtent[1]) {
          break;
        }

        if (this.hasResponseIdentifier && !this.secretIds.includes(response.secretId)) {
          continue;
        }

        for (let [index, feature] of this.features.entries()) {
          if (response[feature.slug] !== undefined) {
            x = this.getX(response);
            y = this.radius + this.padding.top + this.heightPerFeature * index;

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
                const x = this.getX(response);
                const dateStr = moment(response.date).format('MMM-DD, YYYY');
                const y = this.radius + this.padding.top + this.heightPerFeature * index;

                tooltip.style.left = (x + this.labelWidth) + 'px';
                tooltip.style.padding = '5px';
                tooltip.style.top = y - this.heightPerFeature + 'px';
                tooltip.style.color = 'red';

                let responseCount = this.responseDates[dateStr][feature.slug].length;
                tooltip.innerText = this.$t('numberOfTimes', { number: responseCount, suffix: responseCount > 1 ? 's' : '' });
              });
          }
        }

        if (this.item.multiChoiceStatusByVersion[response.version]) {
          x = y = -1;
        }

        prevX = x;
        prevY = y;
      }
    },
  }
}
</script>
