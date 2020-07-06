<template>
  <div class="TokenChart" ref="container" >
    <svg :id="plotId" >
      <g class="x-axis"/>
      <g class="y-axis"/>
      <g class="chart"/>
      <g class="legend-container"/>
      <g
        class="tooltip"
        style="display: none"
      >
        <rect
          width="80"
          height="25"
          fill="white"
          stroke="#BBB"
          stroke-width="0.5px"
        />
        <text
          x="40"
          dy="1.5em"
          style="text-anchor: middle"
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
  height: 400px;
  vertical-align: top;
  margin: 2rem 1rem;
  margin-bottom: 0;
}

.TokenChart > svg {
  display: block;
  overflow: visible;
}

.TokenChart .y-axis .tick line {
  stroke: #F3F3F3;
}

.TokenChart .y-axis .tick text {
  transform: translate(-10px, 0) !important;
  color: #AAA;
}

.TokenChart .x-axis .tick line {
  display: none;
}


.TokenChart .y-axis .domain,
.TokenChart .x-axis .domain {
  stroke: transparent;
}

.TokenChart .x-axis .tick text {
  transform: translate(0, 10px) !important;
  color: #555;
}

.TokenChart .tooltip {
  z-index: 9999;
}
</style>


<script>
import * as d3 from 'd3';

/**
 * TokenChart component.
 */
export default {
  name: 'TokenChart',

  /**
   * Component properties.
   */
  props: {
    plotId: String,
    data: Array,
    features: Array,
  },

  data: () => ({
    legendWidth: 150,
    margin: {
      top: 40,
      right: 200,
      bottom: 50,
      left: 30,
    }
  }),

  computed: {
    dateExtent() {
      return d3.extent(this.data.map(d => d.date));
    },

    valueExtent() {
      let min = 0;
      let max = 0;
      let currentMin = 0;
      let currentMax = 0;
      let currentVal = 0;

      this.data.forEach(d => {
        currentMin = 0;
        currentMax = 0;

        this.features.forEach(f => {
          currentVal =  d[f.name];

          if (currentVal > 0) currentMax += currentVal;
          if (currentVal < 0) currentMin += currentVal;
        })

        if (currentMin < min) min = currentMin;
        if (currentMax > max) max = currentMax;
      });

      return [min - 2, max + 2];
    },

    maxCummulativeTokens() {
      let dates = {};

      this.data.forEach(d => {
        const dateStr = d.date.toDateString();
        let currentDate = dates[dateStr];

        if (!currentDate) {
          dates[dateStr] = currentDate = 0;
        }

        if (d.tokens > 0) {
          dates[dateStr] += d.tokens;
        }
      });

      return Math.max(...Object.values(dates));
    },

    minCummulativeTokens() {
      let dates = {};

      this.data.forEach(d => {
        const dateStr = d.date.toDateString();
        let currentDate = dates[dateStr];

        if (!currentDate) {
          dates[dateStr] = currentDate = 0;
        }

        if (d.tokens < 0) {
          dates[dateStr] += d.tokens;
        }
      });

      return Math.min(...Object.values(dates));
    },

    daysCount() {
      const from = this.dateExtent[0].getTime();
      const to = this.dateExtent[1].getTime();

      return Math.ceil((to - from) / (1000 * 3600 * 24));
    },

    negatives() {
      return this.features.filter(f => f.value < 0).map(f => f.name);
    },

    positives() {
      return this.features.filter(f => f.value > 0).map(f => f.name);
    },

    colors() {
      return new Map(this.features.map(f => [
        f.name,
        f.color,
      ]));
    },

    signs() {
      return new Map(this.features.map(f => [
        f.name,
        f.value >= 0 ? 1 : -1,
      ]));
    },

    y() {
      return d3
        .scaleLinear()
        .domain(this.valueExtent)
        .range([this.height, 0]);
    },

    x() {
      return d3
        .scaleTime()
        .nice()
        .domain(this.dateExtent)
        .range([0, this.width - this.margin.left]);
    },
  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.render();
    window.addEventListener('resize', this.render.bind(this))
  },

  /**
   * Component methods.
   */
  methods: {
    barWidth() {
      return Math.min(this.width / this.daysCount - 10, 50);
    },

    resize() {
      const dimensions = this.$refs.container.getBoundingClientRect();
      this.width = dimensions.width - this.margin.left - this.margin.right;
      this.height = dimensions.height - this.margin.top - this.margin.bottom;

      // Set dimensions.
      this.svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
    },
    /**
     * Renders the histogram with the plotted data.
     *
     * @return {void}
     */
    render() {
      this.svg = d3.select('#' + this.$options.propsData.plotId);

      this.resize();
      this.drawAxes();
      this.drawLegend();
      this.plotStackedData();
    },

    /**
     * Draws the axes for the histogram.
     *
     * @return {void}
     */
    drawAxes() {
      const { data } = this.$options.propsData;
      const barWidth = this.barWidth();

      // Axes.
      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .ticks(this.daysCount)
        .tickSize(this.height)
        .tickFormat(d => d.toLocaleDateString(
          'default',
          { day: 'numeric', month: 'short' },
        ));

      // Append the x-axis.
      this.svg
        .select('.x-axis')
        .attr('transform', `translate(${this.barWidth()/2}, 0)`)
        .call(xAxis)

      const yAxis = d3
        .axisLeft()
        .scale(this.y)
        .tickSize(-this.width - barWidth);

      this.svg
        .select('.y-axis')
        .call(yAxis);
    },

    /**
     * Draws the legend for the chart.
     *
     * @return {void}
     */
    drawLegend() {
      const { svg } = this;
      const { features } = this.$options.propsData;
      const featureArray = Object.values(features);

      svg
        .selectAll('.legend')
        .remove();

      const legend = svg
        .selectAll('.legend')
        .data(featureArray)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(30, ${i*28})`);

      // Render the color square.
      legend
        .append('rect')
        .attr('y', this.margin.top)
        .attr('x', this.width + this.margin.left + 10)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', f => f.color);

      // Render the legend text.
      legend
        .append('text')
        .attr('x', this.width + this.margin.left + 40)
        .attr('y', this.margin.top + 9)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text(f => f.name);
    },

    /**
     * Draws the stacked histogram.
     *
     * @return {void}
     */
    plotStackedData() {
      const { svg, x, y, data, features } = this;
      const barWidth = this.barWidth();
      const stack = d3.stack()
        .keys(Object.values(features).map(f => f.name))
        .offset(d3.stackOffsetDiverging);
      const layers = stack(data);
      const tooltip = svg.select('.tooltip');

      svg
        .select('.chart')
        .selectAll('.layer')
        .remove()

      svg
        .select('.chart')
        //.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .selectAll('.layer')
        .data(layers)
        .join('g')
        .attr('class', 'layer')
        .attr('fill', layer => {
          return Object.values(features).find(f => layer.key === f.name).color
        })
        .attr('opacity', '0.8')

        // Create the individual bars.
        .selectAll('rect')
        .data(layer => layer)
        .join('rect')

        // Set the bar position and dimension.
        .attr('x', d => x(d.data.date))
        .attr('width', s => barWidth)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))

        // Tooltip
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', d => {
          const x = d3.mouse(d3.event.currentTarget)[0];
          const y = d3.mouse(d3.event.currentTarget)[1] - 30;
          const date = d.data.date.toLocaleDateString(
            'default',
            { day: 'numeric', month: 'short' },
          );

          tooltip.attr('transform', `translate(${x}, ${y})`);
          tooltip.select('text').text(`${date}: ${d[1]-d[0]}`);
        });
    },
  },
};

</script>
