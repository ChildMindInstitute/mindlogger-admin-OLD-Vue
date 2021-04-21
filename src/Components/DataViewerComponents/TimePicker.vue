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
      <g
        class="content"
        :transform="`translate(${labelWidth}, 0)`"
      >
        <g class="x-axis" />
        <g class="y-axis" />
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
        :size="50"
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
  name: 'TimePicker',
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
    minValue: {
      type: Object,
      required: true
    },
    maxValue: {
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

    let { data } = this.item.getTimeResponseData();

    let width = this.parentWidth - margin.left - margin.right;

    return {
      // height: features.length * heightPerFeature,
      heightPerFeature,
      margin,
      width,
      height: 500,
      space: 20,
      labelWidth: width / 4,
      data,
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
      const max = new Date().setHours(this.maxValue.hour, this.maxValue.minute, 0, 0);
      const min = new Date().setHours(this.minValue.hour, this.minValue.minute, 0, 0);
      
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width - this.labelWidth]);

      this.y = d3
        .scaleTime()
        .domain([min, max])
        .nice()
        .range([this.height, this.space])

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(this.getTickType());

      const yAxis = d3
        .axisLeft()
        .scale(this.y)
        // .tickSize(this.tickHeight)
        .ticks(this.maxValue.hour - this.minValue.hour)

      this.svg
        .select('.x-axis')
        .selectAll('.feature-axis')
        .remove();

      this.svg
        .select('.y-axis')
        .append('g')
        .attr('class', 'feature-axis')
        .style('stroke-width', 1.2)
        .style('color', '#373737')
        // .attr('transform', d => `translate(${(this.width - this.labelWidth) - ((this.width - this.labelWidth) / 6 * i)}, 0)`)
        .call(yAxis.tickFormat(d => moment(d).format('hh:mm A')));

      for (let i = 0; i <= this.maxValue.hour - this.minValue.hour; i += 1) {
        this.svg
          .select('.x-axis')
          .append('g')
          .attr('class', 'feature-axis')
          .style('stroke-width', i === 0 ? 1.5 : 1)
          .style('color', i === 0 ? '#373737' : '#979797')
          .attr('transform', d => `translate(0, ${this.height - (this.height / (this.maxValue.hour - this.minValue.hour + 1) + 1.2) * i})`)
          .call(xAxis.tickFormat(d => i === 0 ? moment(d).format('MMM-D') : ''));
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
        let response = this.data[i];

        if (response.date < this.focusExtent[0]) {
          continue;
        }

        if (response.date > this.focusExtent[1]) {
          break;
        }

        const x = this.x(response.date);
        const y = this.y(response.value);

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
            // const x = this.x(response.date);
            // const dateStr = moment(response.date).format('MMM-DD, YYYY');
            // const y = this.radius + this.padding.top + this.heightPerFeature * index;

            // tooltip.style.left = (x + this.labelWidth) + 'px';
            // tooltip.style.padding = '5px';
            // tooltip.style.top = y - this.heightPerFeature + 'px';
            // tooltip.style.color = 'red';

            // let responseCount = this.responseDates[dateStr][feature.slug].length;
            // tooltip.innerText = this.$t('numberOfTimes', { number: responseCount, suffix: responseCount > 1 ? 's' : '' });
          });

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
