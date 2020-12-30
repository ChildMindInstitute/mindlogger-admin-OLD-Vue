<template>
  <div
    class="subscale-bar-chart"
  >
    <svg
      :id="plotId"
      :width="width + 20"
      :height="height + padding.top + padding.bottom + 20"
    >
      <g>
        <text
          :y="padding.top + height / 2"
          :x="(width - chartWidth) / 4"
          :font-size="17"
          text-anchor="middle"
          font-weight="bold"
        >
          Subscale Scores
        </text>
      </g>
      <g
        class="content"
        :transform="`translate(${(width - chartWidth) / 2}, 0)`"
      >
        <g class="x-axis">
          <g class="main-axis" />
          <g class="other-axis" />
        </g>
        <g class="y-axis">
          <g class="main-axis" />
          <g class="other-axis" />
        </g>

        <g class="responses" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.subscale-bar-chart {
  display: inline-block;
  position: relative;
  user-select: none;
  margin: 10px 24px;
  padding: 10px 20px;
  border: 2px solid black;
}

</style>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import { DrawingMixin } from '../Utils/mixins/DrawingMixin';

export default {
  name: 'SubScaleLineChart',
  mixins: [DrawingMixin],
  props: {
    plotId: {
      type: String,
      required: true,
    },
    activity: {
      type: Object,
      required: true
    },
  },
  data: function() {
    let margin = { left: 20, right: 60 };
    let width = this.parentWidth - margin.left - margin.right;

    return {
      margin,
      width,
      chartWidth: width / 3,
      height: this.getChartHeight(width),
      divergingExtent: this.getValueExtent(),
      maxBarWidth: 80,
      xRangePerBar: 3,
      responseStrokeWidth: 2,
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
    parentWidth: {
      deep: false,
      handler(newValue) {
        this.width = newValue - this.margin.left - this.margin.right;
        this.height = this.getChartHeight(this.width);
        this.chartWidth = this.width / 3;
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
      this.drawResponses();
    },

    drawAxes() {
      const barWidth = Math.min(this.chartWidth / this.activity.subScales.length / 3 * 2, this.maxBarWidth);
      const maxX = Math.ceil(this.chartWidth / barWidth) * this.xRangePerBar;

      this.x = d3
        .scaleLinear()
        .domain([0, maxX])
        .range([0, this.chartWidth]);

      this.y = d3
          .scaleLinear()
          .domain([this.divergingExtent.min, this.divergingExtent.max])
          .range([this.height + this.padding.top, this.padding.top]);

      const xTicks = [];
      for (let i = 0; i < maxX; i++) {
        xTicks.push(i);
      }

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickValues(xTicks)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(maxX)
        .tickFormat('');

      this.svg
        .select('.x-axis .main-axis')
        .style('stroke-width', 2)
        .attr('transform', `translate(0, ${this.y(this.divergingExtent.min)})`)
        .call(xAxis);

      const yTicks = this.y.ticks().filter(Number.isInteger);
      const yAxis = d3
          .axisLeft()
          .scale(this.y)
          .tickValues(yTicks)
          .tickSize(this.tickWidth)  // Width of the tick line.
          .ticks(this.divergingExtent.max - this.divergingExtent.min)
          .tickFormat(d3.format('d'));

      this.svg
        .select('.y-axis .main-axis')
        .style('stroke-width', 2)
        .call(yAxis);


      this.svg
        .select('.x-axis .other-axis')
        .selectAll('line')
        .data(xTicks.filter(x => x))
        .join('line')
        .style('stroke-width', 2)
        .attr('x1', d => this.x(d))
        .attr('y1', this.y(this.divergingExtent.min))
        .attr('y2', this.y(this.divergingExtent.max))
        .attr('x2', d => this.x(d))
        .attr('stroke-dasharray', 2)
        .style('stroke', 'grey')

      this.svg
        .select('.y-axis .other-axis')
        .selectAll('line')
        .data(yTicks.filter(y => y != this.divergingExtent.min))
        .join('line')
        .style('stroke-width', 2)
        .attr('x1', this.x(0))
        .attr('y1', d => this.y(d))
        .attr('y2', d => this.y(d))
        .attr('x2', this.x(maxX))
        .attr('stroke-dasharray', 2)
        .style('stroke', 'grey')
    },

    drawResponses() {
      const barWidth = this.x(this.xRangePerBar) - this.x(0);

      this.svg
        .select('.responses')
        .selectAll('*')
        .remove();

      const baseY = this.y(this.divergingExtent.min);
      this.svg
        .select('.responses')
        .selectAll('.sub-scale')
        .data(this.activity.subScales.map((subScale, index) => {
          const d = subScale.values.find(d => {
            const date = new Date(d.date);

            return date >= this.focusExtent[0] && 
                   date <= this.focusExtent[1] && 
                   this.selectedVersions.includes(d.version);
          });

          return {
            id: index,
            value: d.value,
            dataColor: subScale.dataColor,
          }
        }))
        .join('rect')
        .attr('class', 'sub-scale')
        .attr('fill', d => d.dataColor)
        .attr('x', d => this.x(d.id * this.xRangePerBar) + 2)
        .attr('width', barWidth - 4)
        .attr('y', d => this.y(d.value))
        .attr('height', d => baseY - this.y(d.value))
        .style('stroke-width', this.responseStrokeWidth)
        .style('stroke', 'grey')
    },

    getValueExtent() {
      const { min, max } = this.activity.getValueExtent(this.focusExtent, this.selectedVersions);
      return {
        min: Math.min(0, min),
        max: max + 10,
      }
    }
  },
}
</script>
