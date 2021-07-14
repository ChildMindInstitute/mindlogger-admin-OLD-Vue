<template>
  <div
    class="subscale-bar-chart"
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
      ref="responses"
    >
      <g>
        <text
          :y="padding.top + height / 2"
          :x="(width - chartWidth) / 4"
          :font-size="17"
          text-anchor="middle"
          font-weight="bold"
        >
          {{ $t('subScaleScores') }}
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

<style scoped>

.subscale-bar-chart {
  display: inline-block;
  position: relative;
  user-select: none;
  margin: 10px 24px;
  padding: 10px 20px;
  border: 2px solid black;
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
      chartWidth: width / 3,
      height: this.getChartHeight(width),
      divergingExtent: this.getValueExtent(),
      maxBarWidth: 80,
      xRangePerBar: 3,
      responseStrokeWidth: 2,

      toolTipVisible: false,
      toolTipX: 0,
      toolTipY: 0,
      tooltipWidth: 350,
      tooltipHeight: 120,
      outputText: '',
      cachedContents: {},
      currentResponse: null
    }
  },

  created() {
    this.onMouseDown = (evt) => {
      const src = evt.srcElement;

      if (this.$refs && this.$refs.responses) {
        const responseId = src.getAttribute('responseId');
        const subScaleId = src.getAttribute('subScaleId');

        if (this.$refs.responses.contains(src) && responseId) {
          if (
            !this.currentResponse ||
            this.currentResponse.responseId != responseId ||
            this.currentResponse.subScaleId != subScaleId
          ) {
            this.subScale = this.activity.subScales[subScaleId];
            this.currentResponse = { responseId, subScaleId };
            const d = this.subScale.values.find(d => d.value.responseId == responseId)

            if (d.value.outputText) {
              this.showSubScaleToolTip(
                this.x(( subScaleId * this.xRangePerBar) + 2),
                this.y(d.value.tScore),
                d.value,
                (this.width - this.chartWidth) / 2,
                this.width,
                this.height
              )
            } else {
              this.hideTooltip();
            }

            this.drawResponses();
          }

          return ;
        }
      }

      if (this.toolTipVisible) {
        this.currentResponse = null;
        this.drawResponses();
        this.hideTooltip();
      }
    }

    window.addEventListener('mousedown', this.onMouseDown);
  },
  beforeDestroy() {
    window.removeEventListener('mousedown', this.onMouseDown);
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
        .style('stroke-width', 1.2)
        .style('color', '#373737')
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
            value: (d && d.value || { tScore: 0 }),
            dataColor: subScale.dataColor,
          }
        }))
        .join('rect')
        .attr('class', 'sub-scale')
        .attr('fill', d => d.dataColor)
        .attr('x', d => this.x(d.id * this.xRangePerBar) + 2)
        .attr('width', barWidth - 4)
        .attr('y', d => this.y(d.value.tScore))
        .attr('height', d => baseY - this.y(d.value.tScore))
        .style('stroke-width', this.responseStrokeWidth)
        .style('stroke', 'grey')
        .attr('responseId', d => d.value.responseId)
        .attr('subScaleId', d => d.id)
        .style('outline', d => {
          if (
            this.currentResponse &&
            this.currentResponse.responseId == d.value.responseId &&
            this.currentResponse.subScaleId == d.id
          ) {
            return 'blue auto 5px';
          }

          return ''
        })
    },

    getValueExtent() {
      const { min, max } = this.activity.getValueExtent();
      return {
        min: Math.min(0, min),
        max: max + 10,
      }
    }
  },
}
</script>
