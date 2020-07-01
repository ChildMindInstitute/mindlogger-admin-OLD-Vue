<template>
  <div class="BarChart" ref="container" >
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
          width="70"
          height="25"
          fill="white"
          stroke="#BBB"
          stroke-width="0.5px"
        />
        <text
          x="35"
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
.BarChart {
  display: inline-block;
  position: relative;
  width: 100%;
  height: 400px;
  vertical-align: top;
  overflow: hidden;
}

.BarChart > svg {
  display: block;
}

.BarChart .y-axis .tick line {
  stroke: #F3F3F3;
}

.BarChart .y-axis .tick text {
  transform: translate(-15px, 0) !important;
  color: #AAA;
}

.BarChart .x-axis .tick line {
  display: none;
}

.BarChart .x-axis .tick text {
  color: #555;
}

.BarChart .tooltip {
  z-index: 9999;
}
</style>


<script>
import * as d3 from 'd3';

/**
 * BarChart component.
 */
export default {
  name: 'BarChart',

  /**
   * Component properties.
   */
  props: {
    plotId: String,
    data: Array,
    features: Object,
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
      return d3.extent(this.data, d => {
        d.date.setHours(0);
        d.date.setMinutes(0);
        d.date.setSeconds(0);
        return d.date;
      });
    },
    daysCount() {
      const from =this.dateExtent[0].getTime();
      const to =this.dateExtent[1].getTime();

      return Math.ceil((to - from) / (1000 * 3600 * 24));
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
      return this.width / this.daysCount - 8 ;
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


      // Calculate the maximum and minimum value for this dataset.
      const valueExtent = d3.extent(
        data
          .map(
            item => Object
                  .values(item)
                  .filter(value => !(value instanceof Date))
                  .reduce((sum, current) => sum + current, 0)
          )
          .concat([0]),
      );

      // Scales.
      this.yScale = d3
        .scaleLinear()
        .domain(valueExtent)
        .range([this.height, 0]);
      this.xScale = d3
        .scaleTime()
        .nice()
        .domain(this.dateExtent)
        .range([0, this.width]);

      // Axes.
      const xAxis = d3
        .axisBottom()
        .scale(this.xScale)
        .ticks(this.daysCount)
        .tickFormat(d => d.toLocaleDateString(
          'default',
          { day: 'numeric', month: 'short' },
        ));
      const yAxis = d3
        .axisLeft()
        .scale(this.yScale)
        .tickSize(-this.width - this.barWidth());

      this.svg
        // Append the y-axis.
        .select('.y-axis')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
        .call(yAxis)
        // Hide the axis line.
        .select('.domain')
        .attr('stroke-width', 0);

      this.svg
        // Append the x-axis.
        .select('.x-axis')
        .attr(
          'transform',
          `translate(
            ${this.margin.left  },
            ${this.margin.top + this.height + 10}
          )`
        )
        .call(xAxis)
        // Rotate the x-axis labels.
        .selectAll('text')
        .style('text-anchor', 'center')
        .attr('transform', d => `translate(${-this.barWidth()/4}, 10) rotate(-65)`);

        // Hide the x-axis line.
        this.svg
          .select('.x-axis')
          .select('.domain')
          .attr('stroke-width', 0);
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
      const { svg, xScale, yScale } = this;
      const { data, features } = this.$options.propsData;
      const stack = d3.stack().keys(Object.values(features).map(f => f.name));
      const layers = stack(data);
      const tooltip = svg.select('.tooltip');

      svg
        .select('.chart')
        .selectAll('.layer')
        .remove()

      svg
        .select('.chart')
        // Create one layer per feature.
        .selectAll('.layer')
        .data(layers)
        .join('g')
        .attr('class', 'layer')
        .attr('fill', layer => {
          return Object.values(features).find(f => layer.key === f.name).color
        })
        // Create the individual bars.
        .selectAll('rect')
        .data(layer => layer)
        .join('rect')
        // Set the bar position and dimension.
        .attr('x', d => xScale(d.data.date) + this.margin.left)
        .attr('width', s => this.barWidth())
        .attr('y', d => yScale(d[1]) + this.margin.top)
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
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
