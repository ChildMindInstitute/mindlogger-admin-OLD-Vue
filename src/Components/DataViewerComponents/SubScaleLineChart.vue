<template>
  <div
    class="subscale-line-chart"
  >
    <svg
      :id="plotId"
      :width="width + 20"
      :height="height + padding.top + padding.bottom + 20"
    >
      <foreignObject
        class="labels"
        :x="0"
        :y="padding.top"
        :width="labelWidth - 20"
        :height="height"
      >
        <div class="chart-labels">
          <div class="chart-title">
            Subscale Scores
          </div>

          <div
            v-for="(subScale, index) in activity.subScales"
            :key="index"
            class="sub-scale"
          >
            <div
              class="sub-scale-title"
            >
              {{ subScale.variableName }}
            </div>
            <div
              class="sub-scale-color"
              :style="{ background: subScale.dataColor }"
            />
          </div>
        </div>
      </foreignObject>

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
</template>

<style lang="scss" scoped>

.subscale-line-chart {
  display: inline-block;
  position: relative;
  user-select: none;
  margin: 10px 24px;
  padding: 10px 20px;
  border: 2px solid black;
}

.chart-title {
  text-align: center;
  font-weight: 600;
  font-size: 17px;

  margin-bottom: 20px;
}

.chart-labels {
  position: relative;
  top: 50%;
  transform: translate(0, -50%);
}

.sub-scale {
  padding: 10px 20px;
  font-size: 14px;
  display: flex;
}

.sub-scale-title {
  width: 70%;
  text-align: center;
}
.sub-scale-color {
  width: 30%;
  border-radius: 5px;
  border: 2px solid grey;
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
      labelWidth: width / 4,
      height: this.getChartHeight(width),
      divergingExtent: this.getValueExtent(),
      responseLineWidth: 2.5,
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
        this.height = this.getChartHeight(this.width);
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

    drawAxes() {
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width - this.labelWidth]);

      this.y = d3
          .scaleLinear()
          .domain([this.divergingExtent.min, this.divergingExtent.max])
          .range([this.height + this.padding.top, this.padding.top]);

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(d3.timeDay)
        .tickFormat(d => moment(d).format('MMM-D'));

      this.svg
        .select('.x-axis')
        .style('stroke-width', 2)
        .attr('transform', `translate(0, ${this.y(0)})`)
        .call(xAxis);

      const yAxis = d3
          .axisLeft()
          .scale(this.y)
          .tickValues(this.y.ticks().filter(Number.isInteger))
          .tickSize(this.tickWidth)  // Width of the tick line.
          .ticks(this.divergingExtent.max)
          .tickFormat(d3.format('d'));

      this.svg
        .select('.y-axis')
        .style('stroke-width', 2)
        .call(yAxis);
    },

    drawResponses() {
      this.svg
        .select('.responses')
        .selectAll('*')
        .remove();

      this.svg
        .select('.responses')
        .selectAll('.sub-scale')
        .data(this.activity.subScales)
        .join('path')
        .attr('class', 'sub-scale')
        .attr('fill', 'transparent')
        .attr('d', subScale => {
          const d = subScale.values.map(d => {
            if (this.selectedVersions.includes(d.version)) {
              const x = this.x(new Date(d.date));
              const y = this.y(d.value);
              return `L ${Math.max(x, 2)} ${y}`;
            }
            return '';
          }).join(' ');

          if (d.length) {
            return 'M' + d.slice(1);
          }
          return d;
        })
        .style('stroke-width', this.responseLineWidth)
        .style('stroke', subScale => subScale.dataColor)
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
