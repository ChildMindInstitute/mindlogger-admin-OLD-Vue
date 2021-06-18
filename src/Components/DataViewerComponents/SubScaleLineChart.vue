<template>
  <div
    class="subscale-line-chart"
  >
    <div
      v-show="toolTipVisible && cachedContents[outputText]"
      class="tooltip"
      :style="`left: ${toolTipX}px; top: ${toolTipY}px; width: ${tooltipWidth}px; max-height: ${tooltipHeight}px`"
    >
      <mavon-editor
        :value="cachedContents[outputText]"
        :language="'en'"
        :toolbarsFlag="false"
      >
      </mavon-editor>
    </div>
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
        <div
          class="chart-labels"
          :style="`max-height: ${height-20}px;`"
        >
          <div class="chart-title">
            {{ $t('subScaleScores') }}
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
        <g class="x-axis">
          <g class="main-axis" />
          <g class="other-axis" />
        </g>

        <g class="y-axis">
          <g class="main-axis" />
          <g class="other-axis" />
        </g>

        <g class="versions" />
        <g class="responses" />

        <g class="tooltip-circles">
          <g
            v-for="subScale in activity.subScales"
            :key="subScale.slug"
            :class="subScale.slug"
          >
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>

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
  overflow-y: auto;
  direction: rtl;
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

.tooltip {
  border: 1px solid black;
  position: absolute;
  overflow-y: scroll;
}

.tooltip /deep/ .v-note-edit {
  display: none;
}

.tooltip /deep/ .v-note-show {
  width: 100% !important;
  flex: 0 0 100% !important;
}

.tooltip .v-note-wrapper {
  min-height: unset;
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
    },
    currentResponseDate() {
      this.render();
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
    this.$nextTick(() => {
      this.render();
    });
  },
  computed: {
    currentResponseDate() {
      if (this.activity.subScales.length) {
        const responseId = this.activity.subScales[0].current.responseId;
        const d = this.activity.subScales[0].values.find(d => d.value.responseId == responseId);

        return d ? new Date(d.date) : null;
      }

      return null;
    }
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

      const xTicks = [];

      for (let tick = this.focusExtent[0]; tick <= this.focusExtent[1]; tick = moment(tick).add(1, 'day').toDate()) {
        xTicks.push(tick);
      }

      const yTicks = this.y.ticks().filter(Number.isInteger);

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .tickValues(xTicks)
        .ticks(d3.timeDay)
        .tickFormat(d => moment(d).format('MMM-D'));

      this.svg
        .select('.x-axis .main-axis')
        .style('stroke-width', 1.2)
        .style('color', '#373737')
        .attr('transform', `translate(0, ${this.y(0)})`)
        .call(xAxis);

      const yAxis = d3
          .axisLeft()
          .scale(this.y)
          .tickValues(yTicks)
          .tickSize(this.tickWidth)  // Width of the tick line.
          .ticks(this.divergingExtent.max)
          .tickFormat(d3.format('d'));

      this.svg
        .select('.y-axis .main-axis')
        .style('stroke-width', 1.2)
        .style('color', '#373737')
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
        .attr('x1', this.x(this.focusExtent[0]))
        .attr('y1', d => this.y(d))
        .attr('y2', d => this.y(d))
        .attr('x2', this.x(this.focusExtent[1]))
        .attr('stroke-dasharray', 2)
        .style('stroke', 'grey')
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
          const d = subScale.values.filter(
            value =>
              (!this.currentResponseDate || new Date(value.date) >= this.currentResponseDate) &&
              (!this.hasResponseIdentifier || this.secretIds.includes(value.secretId))
          ).map(d => {
            if (this.selectedVersions.includes(d.version)) {
              const x = this.getX(d);
              const y = this.y(d.value.tScore);

              return `L ${Math.max(x, 2)} ${y}`;
            }
            return '';
          }).join(' ');

          if (d.length) {
            return 'M' + d.slice(1);
          }
          return d;
        })
        .style('stroke-width', d => d.isFinalSubScale ? this.responseLineWidth+1 : this.responseLineWidth)
        .style('stroke', subScale => subScale.dataColor)

      for (let i = 0; i < this.activity.subScales.length; i++) {
        const subScale = this.activity.subScales[i];

        this.svg
          .select(`.tooltip-circles .${subScale.slug}`)
          .selectAll('.tooltip-circle')
          .data(subScale.values.filter(
            value => !this.currentResponseDate || new Date(value.date) >= this.currentResponseDate
          ).map(d => ({
            ...d,
            position: {
              x: this.getX(d),
              y: this.y(d.value.tScore)
            }
          })).filter(d => d.position.x >= 0))
          .join('circle')
          .attr('class', 'tooltip-circle')
          .attr('fill', subScale.dataColor)
          .attr('cx', d => d.position.x)
          .attr('cy', d => d.position.y)
          .attr('r', d => d.value.outputText ? this.radius / 2 : 2)
          .on('focus', d => d.value.outputText ? this.showSubScaleToolTip(
            d.position.x,
            d.position.y,
            d.value,
            this.labelWidth,
            this.width,
            this.height
          ) : '')
          .on('blur', d => this.hideTooltip())
      }
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
