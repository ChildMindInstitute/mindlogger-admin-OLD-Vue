<template>
  <div class="TokenChart" ref="container" >
    <div class="legend">
      <div 
        class="legend-item" 
        v-for="feature in features"
        :key="feature.name.en"
      >
        <div 
          class="color-box"
          :style="{ background: feature.color }">
        </div>
        <div class="label">
          {{ feature.name.en }}
        </div>
      </div>
    </div>

    <div class="time-range">
      Showing data from
      <span class="date">{{ fromDate }}</span>
      to
      <span class="date">{{ toDate }}</span>
    </div>

    <svg :id="plotId" >
      <defs>
        <clipPath id="clip">
          <rect
            width="500"
            height="300"
          />
        </clipPath>
      </defs>

      <g class="y-axis"/>
      <g class="x-axis"/>
      <g
        class="chart"
        clip-path="url(#clip)"
      />

      <g class="context-y-axis"/>
      <g class="context-x-axis"/>
      <g
        class="context-chart"
        clip-path="url(#clip)"
      />

      <g
        class="tooltip"
        style="display: none"
      >
        <rect
          height="25"
          fill="white"
          stroke="#BBB"
          stroke-width="0.5px"
        />
        <text
          dx="8px"
          dy="1.5em"
          font-size="12px"
          font-weight="bold"
        >
        </text>
      </g>
    </svg>
  </div>
</template>


<style>
.TokenChart {
  display: inline-block;
  position: relative;
  width: 100%;
  vertical-align: top;
  margin: 0 1rem 2rem 1rem;
  margin-bottom: 0;
  user-select: none;
}

.TokenChart .time-range {
  margin-bottom: 2rem;
  margin-left: -0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
}

.TokenChart .time-range .date {
  margin: 0 0.3rem;
  color: #1976D2;
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

.TokenChart > svg {
  display: block;
  overflow: visible;
  height: 500px;
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
  transform: translate(0, 10px) !important;
}

.TokenChart .tooltip {
  z-index: 9999;
}
</style>


<script>
import * as d3 from 'd3';
import * as moment from 'moment';


const DAY_IN_MS = 24 * 60 * 60 * 1000;
const NOW = new Date();
const TODAY = new Date(Date.UTC(
  NOW.getFullYear(),
  NOW.getMonth(),
  NOW.getDate(),
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
    maxValue: Number,
    minValue: Number,
    plotId: String,
    data: Array,
    features: Array,
  },

  data: () => ({
    legendWidth: 150,
    focusExtent: [ONE_WEEK_AGO, TODAY],
    divergingExtent: {
      min: 0,
      max: 0,
    },
    cummulativeExtent: {
      min: 0,
      max: 0,
    },
    focusMargin: {
      top: 40,
      right: 50,
      bottom: 130,
      left: 30,
    },

    contextMargin: {
      top: 330,
      bottom: 0,
    },
  }),

  computed: {
    fromDate() {
      return moment.utc(this.focusExtent[0]).format('ddd, D MMM YYYY');
    },
    toDate() {
      return moment.utc(this.focusExtent[1]).format('ddd, D MMM YYYY');
    },
  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.render = this.render.bind(this);

    this.computeValueExtent();
    this.render();
    this.drawBrush();
    window.addEventListener('resize', this.render);
  },

  destroyed() {
    window.removeEventListener('resize', this.render);
  },

  /**
   * Component methods.
   */
  methods: {
    contextBarWidth() {
      return this.width / 30 * 2/3;
    },
    focusBarWidth() {
      const range = this.focusExtent;
      const timeDelta = range[1].getTime() - range[0].getTime();
      const numDays = Math.ceil(timeDelta / (24 * 60 * 60 * 1000));

      return Math.min(this.width / numDays * 2/3, 50);
    },

    drawBrush() {
      if (!this.brush) {
        this.brush = d3
          .brushX()
          .on('end', () => {
            if (!d3.event.sourceEvent) return;  // Only transition after input.
            if (!d3.event.selection) return;  // Ignore empty selections.

            const selection = d3.event.selection.map(this.contextX.invert);
            let fromDate = selection[0];
            let toDate = selection[1];


            this.focusExtent = [
              fromDate,
              toDate,
            ];

            this.drawAxes();
            this.drawFocusChart();
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
      let positive;
      let negative;
      let dataPoint;
      let feature;
      let value;

      for (let i = 0; i < this.data.length; i++) {
        // Both counts start in 1 and -1 to allow the maximum and minimum token 
        // values to be included in the chart axis labels.
        //
        // This is due to d3.js optimizing the number of ticks/labels for the
        // available space. d3 tries to include all the labels if there's enough
        // space. If there is not, it will reduce the tick/label count to a
        // dividend of the original count. Hence, if the maximum value is 15,
        // the scale will go from 1 to 14 in steps of 2 (0, 2, 4, 6 and so on).
        // This causes the 15 not to be included in the scale. Adding one to
        // both ends makes sure the scale will go up to 16, which feels more
        // natural.
        positive = 1; 
        negative = -1;
        dataPoint = this.data[i];

        for (let j = 0; j < this.features.length; j++) {
          feature = this.features[j].name.en;
          value = dataPoint[feature];

          if (value === undefined) continue;

          if (value < 0) {
            negative += value;
          } else {
            positive += value;
          }
        }

        if (positive > this.divergingExtent.max) {
          this.divergingExtent.max = positive;
        }

        if (negative < this.divergingExtent.min) {
          this.divergingExtent.min = negative;
        }

        if (dataPoint.cummulative < this.cummulativeExtent.min) {
          this.cummulativeExtent.min = dataPoint.cummulative;
        }
        if (dataPoint.cummulative > this.cummulativeExtent.max) {
          this.cummulativeExtent.max = dataPoint.cummulative;
        }
      };
    },

    resize() {
      const dimensions = this.$refs.container.getBoundingClientRect();
      this.width = dimensions.width - this.focusMargin.left - this.focusMargin.right;
      this.focusHeight = 450 - this.focusMargin.top - this.focusMargin.bottom;
      this.contextHeight = 450 - this.contextMargin.top - this.contextMargin.bottom;

      // Set dimensions.
      this.svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      // Set clip path.
      this.svg
        .select("#clip rect")
        .attr('width', this.width + this.focusBarWidth())
        .attr('height', dimensions.height || 500);


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
        .domain([this.divergingExtent.min, this.divergingExtent.max])
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
        .ticks(d3.utcDay)
        .tickSize(this.focusHeight)  // Height of the tick line.
        .tickFormat(d => moment.utc(d).format('MMM D'));
      const contextXAxis = d3
        .axisBottom()
        .scale(this.contextX)
        .ticks(15)
        .tickSize(this.contextHeight)  // Height of the tick line.
        .tickFormat(d => moment.utc(d).format('M/D'));
      const yAxis = d3
        .axisLeft()
        .scale(this.y)
        .tickSize(-this.width - focusBarWidth)  // Width of the tick line.
        .tickFormat(d3.format('d'));
      const contextYAxis = d3
        .axisLeft()
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
        .style('stroke-width', 3)
        .attr('class', 'base-line')
        .attr('x1', 0)
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
      const { svg, x, y, data, features } = this;
      const barWidth = this.focusBarWidth();
      const stack = d3.stack()
        .keys(features.map(f => f.name.en))
        .offset(d3.stackOffsetDiverging);
      const layers = stack(data);
      const tooltip = svg.select('.tooltip');

      svg
        .select('.chart')
        .selectAll('.layer')
        .remove()

      svg
        .select('.chart')
        .selectAll('.layer')
        .data(layers)
        .join('g')
        .attr('class', 'layer')
        .attr('fill', layer => {
          return features.find(f => layer.key === f.name.en).color
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
        .attr('x', d => x(d.data.date))
        .attr('width', s => barWidth)
        .attr('y', d => y(d[1]))
        .attr('height', d => {
          return y(d[0]) - y(d[1]) || 0;
        })

        // Tooltip
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', function(d) {
          const el = d3.select(this);
          const x = d3.mouse(d3.event.currentTarget)[0];
          const y = d3.mouse(d3.event.currentTarget)[1] - 30;
          const date = d.data.date.toLocaleDateString(
            'default',
            { day: 'numeric', month: 'short' },
          );

          tooltip.attr('transform', `translate(${x}, ${y})`);
          const text = tooltip.select('text');
          text.text(`${d.key}: ${d[1] - d[0]} `);

          tooltip
            .select('rect')
            .attr('width', text.node().getBoundingClientRect().width + 16);
        });
    },

    drawContextChart() {
      const { svg, contextX, contextY, data} = this;
      const barWidth = this.contextBarWidth();

      svg
        .select('.context-chart')
        .selectAll('.bar')
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
        .attr('x', d => contextX(d.date))
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
        .attr('x', d => contextX(d.date))
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
        .attr('x', d => contextX(d.date))
        .attr('width', s => barWidth)
        .attr('y', d => contextY(Math.max(0, d.cummulative)))
        .attr('height', d => Math.abs(contextY(d.cummulative) - contextY(0)))
        .attr('opacity', 0.2);
    }
  },
};

</script>
