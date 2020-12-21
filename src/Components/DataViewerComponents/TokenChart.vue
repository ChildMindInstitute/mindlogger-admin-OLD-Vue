<template>
  <div
    class="TokenChart"
    :class="`TokenChart-${plotId}`"
  >
    <div class="legend">
      <div 
        v-for="feature in features" 
        :key="feature.slug"
        class="legend-item"
      >
        <div 
          class="color-box"
          :style="{ background: feature.color }"
        />
        <div class="label">
          {{ `${feature.name.en} (${feature.value})` }}
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div
          class="tooltip"
          style="display: none"
      >
        <div
          class="cumulative"
        />
        <div
          v-for="feature in features"
          :key="feature.slug" 
          :class="feature.slug"
        />

      </div>
      <svg :id="plotId">
        <defs>
          <clipPath id="clip">
            <rect
                width="500"
                height="300"
            />
          </clipPath>
          <marker id="arrowhead" markerWidth="7" markerHeight="5"
                  refX="0" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="gray"/>
          </marker>
        </defs>

        <g class="y-axis" />
        <g class="x-axis" />
        <g
            class="chart"
            clip-path="url(#clip)">

          <g class="token-accumulation" />
          <text v-for="(accumulation, i) in accumulations" class="accumulation-value" :key="i"
                :x="accumulation.x" :y="accumulation.y" fill="gray">{{accumulation.text}} </text>

        </g>


        <g class="context-y-axis" />
        <g class="context-x-axis" />
        <g
            class="context-chart"
            clip-path="url(#clip)"
        />
      </svg>
    </div>
  </div>
</template>


<style lang="scss">
.TokenChart {
  display: inline-block;
  position: relative;
  width: 100%;
  vertical-align: top;
  margin: 0 1rem 2rem 1rem;
  margin-bottom: 0;
  user-select: none;
}

.TokenChart .legend {
  display: flex;
  flex-wrap: wrap;
  font-size: 0.8rem;
  margin: 1rem 0;
}
.TokenChart .legend .legend-item {
  display: flex;
  align-items: center;
  min-width: 45%;
  margin-right: 30px;
  margin-bottom: 12px;
  flex: 1 1 0px;
}
.TokenChart .legend .legend-item .color-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
}
.TokenChart .chart {
  overflow: hidden;
}
.TokenChart > .chart-container {
  position: relative;
}
.TokenChart > .chart-container > svg {
  display: block;
  overflow: visible;
  height: 650px;
}
.TokenChart > svg .selection {
  fill: rgba(0,0,0, 0.1);
  stroke: #DDD;
  stroke-width: 2;
}
.TokenChart .y-axis .tick line {
  stroke: #EAEAEA;
}
.TokenChart .context-y-axis .tick line {
  stroke: #EFEFEF;
}
.TokenChart .context-y-axis .tick text,
.TokenChart .y-axis .tick text {
  transform: translate(-6px, 0) !important;
  color: #AAA;
}
.TokenChart .context-x-axis .tick line,
.TokenChart .x-axis .tick line {
  display: none;
}
.TokenChart .context-x-axis .domain,
.TokenChart .context-y-axis .domain,
.TokenChart .y-axis .domain,
.TokenChart .x-axis .domain {
  stroke: transparent;
}
.TokenChart .context-x-axis .tick text,
.TokenChart .x-axis .tick text {
  color: #555;
  transform: translate(0, 18px) rotate(-45deg) !important;
  transform-origin: center;
  transform-box: fill-box;
}
.TokenChart .tooltip {
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  width: fit-content;
  position: absolute;
  background: white;
  border: 2px solid #e6e6e6;
  box-shadow: 2px 5px 15px 0px rgba(black, 0.1);
  * {
    width: fit-content;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    padding: 8px 16px;
    width: 100%;
    box-sizing: border-box;
    &:not(:first-of-type) {
      border-bottom: 1px solid #eee;
    }
  }
  max-width: 300px;
}
.TokenChart .toDate,
.TokenChart .fromDate {
  margin: 0 0.5rem !important;
}

</style>


<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import { DaySpan, Day } from 'dayspan';
import Applet from '../../models/Applet';
import Item from '../../models/Item';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const NOW = new Date();
const TODAY = new Date(Date.UTC(
    NOW.getFullYear(),
    NOW.getMonth(),
    NOW.getDate() + 1,
    0,
    0,
    0,
));
const ONE_WEEK_AGO = new Date(TODAY);
const ONE_MONTH_AGO = new Date(TODAY);
ONE_WEEK_AGO.setDate(TODAY.getDate() - 6);
ONE_MONTH_AGO.setMonth(TODAY.getMonth() - 1);
/**
 * TokenChart component.
 */
export default {
  name: 'TokenChart',
  /**
   * Component properties.
   */
  props: {
    plotId: {
      type: String,
      required: true,
    },
    focusExtent: {
      type: Array,
      required: true
    },
    item: {
      type: Object,
      required: true,
    },
    versions: {
      type: Array,
      required: true,
    },
    timezone: {
      type: String, /** format +05:00 */
      required: true,
    },
    hasVersionBars: {
      type: Boolean,
      required: true,
    },
    selectedVersions: {
      type: Array,
      required: true,
    },
    parentWidth: {
      type: Number,
      required: true,
    }
  },
  data: function() {
    return {
      legendWidth: 150,
      divergingExtent: {
        min: 0,
        max: 0,
      },
      focusMargin: {
        top: 40,
        right: 70,
        bottom: 180,
        left: 50,
      },
      contextMargin: {
        top: 500,
        bottom: 30,
      },
      accumulations: [],
      versionBarWidth: 4,
      versionChangeLimitPerDay: 4,
      ...this.item.getFormattedTokenData(),
    }
  },
  computed: {
    fromDate: {
      cache: false,
      get() {
        return moment.utc(this.focusExtent[0]).format('ddd, D MMM YYYY');
      },
    },
    toDate: {
      cache: false,
      get() {
        return moment.utc(this.focusExtent[1]).format('ddd, D MMM YYYY');
      },
    },
    today() {
      return moment()
    },
    /** date in versions array doesn't consider timezone (all are set as UTC) and we need to convert updated times as user's timezone */
    formattedVersions() {
      let offset = `${this.timezone[0] === '+' ? '-' : '+'}${this.timezone.substr(1)}`;
      return this.versions.map(version => {
        /**
         * input => yy-mm-10T23:30:30+00:00 = yy-mm-11T04:30:30+05:00
         * output=> yy-mm-11
         */
        if (!version.updated) {
            return version;
        }
        const formatted = moment(new Date(version.updated.slice(0, -6) + offset).toISOString()).format("YYYY-MM-DD");
        return {
          version: version.version,
          barColor: version.barColor,
          formatted,
          updated: moment.utc(formatted).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        }
      })
    },
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
        this.render();
      }
    }
  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.render = this.render.bind(this);
    this.$nextTick(() => {
      this.computeValueExtent();
      this.render();
      this.drawBrush();
    });
  },
  /**
   * Component methods.
   */
  methods: {
    /*
     * Handles change event for options
     *
     * @return {void}
     */
    onVersionChanged() {
      this.render();
    },
    contextBarWidth() {
      return this.width / 30 / this.versionChangeLimitPerDay;
    },
    focusBarWidth() {
      const range = this.focusExtent;
      const timeDelta = range[1].getTime() - range[0].getTime();
      const numDays = Math.ceil(timeDelta / (24 * 60 * 60 * 1000));
      return Math.min(this.width / numDays / this.versionChangeLimitPerDay - this.versionBarWidth, 40);
    },
    widthPerDate() {
      const range = this.focusExtent;
      const timeDelta = range[1].getTime() - range[0].getTime();
      const numDays = Math.ceil(timeDelta / (24 * 60 * 60 * 1000));
      return this.width / numDays;
    },
    drawBrush() {
      if (!this.brush) {
        this.brush = d3
          .brushX()
          .on('end', () => {
            if (!d3.event.sourceEvent) return;  // Only transition after input.
            if (!d3.event.selection) return;  // Ignore empty selections.
            const selection = d3.event.selection.map(this.contextX.invert);

            this.$emit('onUpdateFocusExtent', [
              selection[0],
              selection[1]
            ])
          });
      }
      d3.selectAll('.overlay').style('pointer-events', 'none');
      d3.selectAll('.handle').style('pointer-events', 'none');
      this.brush.extent([
        [
          0,
          this.contextMargin.top - 5,
        ],
        [
          this.width + this.focusBarWidth(),
          this.contextMargin.top + this.contextHeight + 5,
        ],
      ]);
      if (!this.brushContainer) {
        this.brushContainer = this.svg
            .append('g')
            .call(this.brush)
            .call(
                this.brush.move,
                [ONE_WEEK_AGO, TODAY].map(this.contextX),
            );
      } else {
        this.brushContainer.call(
            this.brush.move,
            this.focusExtent.map(this.contextX),
        );
      }
    },
    computeValueExtent() {
      let cummulative;
      let value;
      // Compute the maximum value of one user response.
      for (let i = 0; i < this.features.length; i++) {
        value = this.features[i].value;
        if (value < 0) {
          this.divergingExtent.min += value;
        } else {
          this.divergingExtent.max += value;
        }
      }
      let positive;
      let negative;
      let cumulativePositiveToken = 0
      // Find the maximum value for cumulative user responses.
      for (let i = 0; i < this.data.length; i++) {
        positive = this.data[i].positive;
        cumulativePositiveToken += positive;
        negative = this.data[i].negative;
        if (positive > this.divergingExtent.max) {
          this.divergingExtent.max = positive;
        }
        if (negative < this.divergingExtent.min) {
          this.divergingExtent.min = negative;
        }
      }
      this.divergingExtent.max = cumulativePositiveToken;
      if (this.divergingExtent.max % 2) {
        this.divergingExtent.max += 1;
      }

      if (this.divergingExtent.min % 2) {
        this.divergingExtent.min -= 1;
      }
    },
    resize() {
      this.width = this.parentWidth - this.focusMargin.left - this.focusMargin.right;

      this.focusHeight = 650 - this.focusMargin.top - this.focusMargin.bottom;
      this.contextHeight = 650 - this.contextMargin.top - this.contextMargin.bottom;
      // Set dimensions.
      this.svg
        .attr('width', this.parentWidth.width);
      // Set clip path.
      this.svg
        .select("#clip rect")
        .attr('width', this.width + this.focusBarWidth())
        .attr('height', 500);
      if (this.brush) {
        // Set brush area.
        this.brush.extent([
          [0, this.contextMargin.top] ,
          [this.width + this.focusBarWidth(), this.contextMargin.top + this.contextHeight],
        ]);
      }
    },
    /**
     * Renders the histogram with the plotted data.
     *
     * @return {void}
     */
    render() {
      this.svg = d3.select('#' + this.plotId);

      this.resize();
      this.drawAxes();
      this.drawBrush();
      this.drawFocusChart();
      this.drawVersionBars();
      this.drawContextChart();
    },
    /**
     * Draws the axes for the histogram.
     *
     * @return {void}
     */
    drawAxes() {
      const focusBarWidth = this.focusBarWidth();
      const contextBarWidth = this.contextBarWidth();
      // Scales.
      this.y = d3
          .scaleLinear()
          .domain([this.divergingExtent.min, this.divergingExtent.max+ 100]) // to show top cumulative number.
          .range([this.focusHeight, 0]);
      this.contextY = d3
          .scaleLinear()
          .domain([this.divergingExtent.min, this.divergingExtent.max])
          .range([this.contextHeight, 0]);
      this.x = d3
          .scaleUtc()
          .nice()
          .domain(this.focusExtent)
          .range([0, this.width]);
      this.contextX = d3
          .scaleUtc()
          .nice()
          .domain([ONE_MONTH_AGO, TODAY])
          .range([0, this.width + focusBarWidth]);
      const range = this.focusExtent;
      const timeDelta = range[1].getTime() - range[0].getTime();
      const numDays = Math.ceil(timeDelta / (24 * 60 * 60 * 1000));
      // X-axis.
      const xAxis = d3
          .axisBottom()
          .scale(this.x)
          .tickSize(this.focusHeight)  // Height of the tick line.
          .ticks(d3.timeDay)
          .tickFormat(d => moment(d).format('MMM D'));
      const contextXAxis = d3
          .axisBottom()
          .scale(this.contextX)
          .ticks(30)
          .tickSize(this.contextHeight)  // Height of the tick line.
          .tickFormat(d => moment(d).format('M/D'));
      const yAxisTicks = this.y.ticks().filter(Number.isInteger);
      const yAxis = d3
          .axisLeft()
          .scale(this.y)
          .tickValues(yAxisTicks)
          .tickSize(-this.width - focusBarWidth)  // Width of the tick line.
          .ticks(this.divergingExtent.max)
          .tickFormat(d3.format('d'));
      const contextYAxisTicks = this.contextY.ticks().filter(Number.isInteger);
      const contextYAxis = d3
          .axisLeft()
          .tickValues(contextYAxisTicks)
          .scale(this.contextY)
          .tickSize(-this.width - focusBarWidth) // Width of the tick line.
          .tickFormat(d3.format('d'));
      // Append the axes.
      this.svg
          .select('.x-axis')
          .attr('transform', `translate(${focusBarWidth/2}, 0)`)
          .call(xAxis);
      this.svg
          .select('.y-axis')
          .call(yAxis)
      this.svg
          .selectAll('.base-line')
          .remove();
      this.svg
          .select('.x-axis')
          .append('line')
          .style('stroke', '#efefef')
          .style('stroke-width', 2)
          .attr('class', 'base-line')
          .attr('x1', -focusBarWidth/2)
          .attr('x2', this.width + focusBarWidth/2)
          .attr('y1', this.y(0))
          .attr('y2', this.y(0));
      // Append the axes.
      this.svg
          .select('.context-x-axis')
          .attr('transform', `translate(0, ${this.contextMargin.top})`)
          .call(contextXAxis);
      this.svg
          .select('.context-y-axis')
          .attr(
              'transform',
              `translate(0, ${this.contextMargin.top})`
          )
          .call(contextYAxis);
      this.svg
          .select('.context-x-axis')
          .append('line')
          .style('stroke', '#efefef')
          .style('stroke-width', 2)
          .attr('class', 'base-line')
          .attr('x1', -contextBarWidth/2)
          .attr('x2', this.width + focusBarWidth)
          .attr('y1', this.contextY(0))
          .attr('y2', this.contextY(0));
    },
    /**
     * Draws the stacked histogram.
     *
     * @return {void}
     */
    drawFocusChart() {
      const { svg, x, y, data, focusMargin, features, plotId } = this;
      const barWidth = this.focusBarWidth();

      const stack = d3.stack()
          .keys(features.map(f => f.id))
          .offset(d3.stackOffsetDiverging);
      const layers = stack(data);
      const tooltip = document.querySelector(`.TokenChart.TokenChart-${plotId} .tooltip`);
      const widthPerDate = this.widthPerDate();

      this.accumulations = [];
      svg
          .select('.chart')
          .selectAll('.layer')
          .remove()
      svg
          .select('.token-accumulation')
          .selectAll('path')
          .remove()
      svg
          .select('.chart')
          .selectAll('.layer')
          .data(layers)
          .join('g')
          .attr('class', 'layer')
          .attr('fill', layer => {
            return features.find(f => layer.key === f.id).color
          })
          // Create the individual bars.
          .selectAll('rect')
          .data(layer => {
            layer.forEach(d => {
              d.key = layer.key;
              return d;
            });
            return layer;
          })
          .join('rect')
          // Set the bar position and dimension.
          .attr('x', d => {
            const maxWidthPerBar = (widthPerDate - barWidth/2) / d.data.bars;
            return x(d.data.date) + barWidth/2 + maxWidthPerBar * d.data.barIndex;
          })
          .attr('width', s => barWidth)
          .attr('y', d => y(d[1]))
          .attr('height', d => {
            return this.selectedVersions.indexOf(d.data.version) >= 0 ? y(d[0]) - y(d[1]) || 0 : 0;
          })
          // Tooltip
          .on('mouseover', () => tooltip.style.display = 'flex')
          .on('mouseout', () => tooltip.style.display = 'none')
          .on('mousemove', function(d) {
            const el = d3.select(this);
            const maxWidthPerBar = (widthPerDate - barWidth/2) / d.data.bars;
            const xCoords = x(d.data.date) + barWidth * 1.8 + maxWidthPerBar * d.data.barIndex;
            const yCoords = y(d.data.positive);
            const padding = 8;
            const cumulativeLabel = 27;
            const date = d.data.date.toLocaleDateString(
                'default',
                { day: 'numeric', month: 'short' },
            );
            tooltip.style.left = xCoords + 'px';
            tooltip.style.top = (yCoords - padding - cumulativeLabel) + 'px';
            for (let i = 0; i < features.length; i++) {
              const text = tooltip.querySelector(`.${features[i].slug}`)
              const name = features[i].name.en;
              const value = d.data[features[i].id];
              if (!value) {
                text.style.display = 'none';
                continue;
              }

              text.innerText = `${name}: ${value}`;
              text.style.top = y(0) - y(value) + 'px';
              text.style.height = y(0) - y(value) + 'px';
              text.style.display = 'flex';
            }
            const text = tooltip.querySelector(`.cumulative`)
            text.innerText = `Cumulative: ${d.data.cummulative}`;
          });
      if (data.length < 1) {
        return;
      }
      let normalisedx = x(data[0].date)
      normalisedx += (0.5 * this.focusBarWidth()) - 5;
      let normalisedy = this.y(data[0].positive)
      let pathString = `M ${normalisedx} ${normalisedy}`;
      let accumulation = data[0].positive;

      for (var i = 1; i <= data.length - 1; i++) {
        const step = data[i]
        const positive = step.positive;
        normalisedx = x(step.date)
        normalisedx += (0.5 * this.focusBarWidth()) - 5;
        normalisedy = this.y(accumulation)

        if (positive > 0){
          pathString += ` L ${normalisedx + 3} ${normalisedy}`
          accumulation = positive + accumulation;
          normalisedy = this.y(accumulation)
          pathString += ` L ${normalisedx + 3} ${normalisedy}`
          this.accumulations.push({text: accumulation, x: normalisedx + (0.5 * this.focusBarWidth()), y: normalisedy -3})
        }
        if (i === data.length -1){
          pathString += ` L ${normalisedx} ${normalisedy}`
        }
      }
      this.svg
          .select('.token-accumulation')
          .append('path')
          .style('stroke', 'gray')
          .attr('fill', 'transparent')
          .style('stroke-width', 2)
          .attr('d', pathString)
          .attr('marker-end', "url(#arrowhead)");
    },
    /**
     * Draw bars (black bar for major change, grey bar for minor change) to represent version changes
     *
     * @return {void}
     */
    drawVersionBars() {
      const { svg, x, y, focusMargin, focusHeight } = this;
      const barWidth = this.focusBarWidth();
      const widthPerDate = this.widthPerDate();
      const formattedVersions = this.formattedVersions;
      svg
          .select('.chart')
          .selectAll('.version')
          .remove()
      if (!this.hasVersionBars) {
        return ;
      }

      svg
          .select('.chart')
          .selectAll('.version')
          .data(formattedVersions.filter(d => d.barColor && this.selectedVersions.indexOf(d.version) >= 0))
          .join('rect')
          .attr('class', 'version')
          .attr('fill', d => d.barColor)
          .attr('x', d => {
            if (d.formatted) {
              const versions = this.versionsByDate[d.formatted] || ['oo'];
              const maxWidthPerBar = (widthPerDate - barWidth/2) / versions.length;
              let index = versions.findIndex(ver => ver == 'oo' || Applet.compareVersions(ver, d.version) >= 0);
              if (index == 0) {
                return x(d.updated);
              }
              if (index < 0) {
                index = versions.length;
              }
              return x(d.updated) + barWidth/2 + maxWidthPerBar * index - (maxWidthPerBar - barWidth)/2 - this.versionBarWidth/2;
            }
            return 0;
          })
          .attr('width', d => {
            return d.updated ? this.versionBarWidth : 0
          })
          .attr('y', 0)
          .attr('height', focusHeight)
    },
    contextWidthPerDate() {
      return this.width / 30;
    },
    drawContextChart() {
      const { svg, contextX, contextY, data} = this;
      const barWidth = this.contextBarWidth();
      const contextWidthPerDate = this.contextWidthPerDate();
      svg
          .select('.context-chart')
          .selectAll('.bar')
          .remove()
      svg
          .select('.context-chart')
          .selectAll('.positive-bar')
          .remove()
      svg
          .select('.context-chart')
          .selectAll('.negative-bar')
          .remove()
      // Negative
      svg
          .select('.context-chart')
          .selectAll('.negative-bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'negative-bar')
          .attr('fill', '#ED8495')
          // Set the bar position and dimension.
          .attr('x', d => {
            const widthPerBar = contextWidthPerDate / d.bars;
            return contextX(d.date) + barWidth/2 + widthPerBar * d.barIndex;
          })
          .attr('width', barWidth)
          .attr('y', contextY(0))
          .attr('height', d => Math.abs(contextY(d.negative) - contextY(0)))
      // Positive
      svg
          .select('.context-chart')
          .selectAll('.positive-bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'positive-bar')
          .attr('fill', '#BEE0AC')
          // Set the bar position and dimension.
          .attr('x', d => {
            const widthPerBar = contextWidthPerDate / d.bars;
            return contextX(d.date) + barWidth/2 + widthPerBar * d.barIndex;
          })
          .attr('width', barWidth)
          .attr('y', d => contextY(d.positive))
          .attr('height', d => Math.abs(contextY(d.positive) - contextY(0)))
      // Cummulative
      svg
          .select('.context-chart')
          .attr('transform', `translate(${-barWidth/2}, ${this.contextMargin.top})`)
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('fill', 'black')
          // Set the bar position and dimension.
          .attr('x', d => {
            const widthPerBar = contextWidthPerDate / d.bars;
            return contextX(d.date) + barWidth/2 + widthPerBar * d.barIndex;
          })
          .attr('width', s => barWidth)
          .attr('y', d => contextY(Math.max(0, d.cummulative)))
          .attr('height', d => Math.abs(contextY(d.cummulative) - contextY(0)))
          .attr('opacity', 0.2);
    },
    // Other Utils
    mergeObject(acc, obj) {
      const result = acc;
      for (let [key, value] of Object.entries(obj)) {
        if (key === "date") continue;
        if (result[key]) {
          result[key] += value;
        } else {
          result[key] = value;
        }
      }
      return result;
    },
    getTokenValuePercent(value){
      if (value > 0 && this.divergingExtent.max === 0 || value < 0 && this.divergingExtent.min === 0)
      {
        return 1;
      }
      return Math.abs(value) / (value > 0? this.divergingExtent.max : Math.abs(this.divergingExtent.min));
    },
    compareDates(accDate, date) {
      if (JSON.stringify(accDate) === JSON.stringify(date)) return true;
      return false;
    }
  },
};
</script>
