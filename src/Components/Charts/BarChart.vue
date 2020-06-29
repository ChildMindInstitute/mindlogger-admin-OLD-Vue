<template>
    <div class="BarChart">

        <!--
        :width="width + margin.left * 2 + margin.right + legendWidth"
        :height="height + margin.top + margin.bottom"
        -->
      <svg
        :id="plotId"
        preserveAspectRatio="xMinYMin meet"
        viewBox="0 0 950 400"
      >
        <g class="x-axis"/>
        <g class="y-axis"/>
        <g class="chart"/>
        <g
          class="tooltip"
          style="display: none"
        >
          <rect
            width="30"
            height="20"
            fill="white"
            stroke="#BBB"
            stroke-width="0.5px"
          />
          <text
            x="15"
            dy="1.2em"
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
    height: fit-content;
    vertical-align: top;
    ove4flow: hidden;
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
    width: 700,
    height: 300,
    legendWidth: 150,
    margin: {
      top: 40,
      right: 50,
      bottom: 50,
      left: 30,
    }
  }),

  computed: {
    barWidth() {
      return 40;
    }
  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.render();
  },

  /**
   * Component methods.
   */
  methods: {
    /**
     * Renders the histogram with the plotted data.
     *
     * @return {void}
     */
    render() {
      this.svg = d3.select('#' + this.$options.propsData.plotId);

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
      const dateExtent = d3.extent(data, d => {
        d.date.setHours(0);
        d.date.setMinutes(0);
        d.date.setSeconds(0);
        return d.date;
      });

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
        .scaleUtc()
        .domain(dateExtent)
        .nice()
        .range([0, this.width]);

      // Axes.
      const xAxis = d3
        .axisBottom()
        .scale(this.xScale)
        .ticks(7);
      const yAxis = d3
        .axisLeft()
        .scale(this.yScale)
        .tickSize(-this.width);

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
            ${this.margin.left + this.barWidth / 2},
            ${this.margin.top + this.height + 10}
          )`
        )
        .call(xAxis)
        // Rotate the x-axis labels.
        .selectAll('text')
        .style('text-anchor', 'center')
        .attr('transform', d => 'rotate(0)');

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

      const legend = svg
        .selectAll('legend')
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
        .attr('x', sequence => xScale(sequence.data.date) + this.margin.left/2)
        .attr('y', sequence => yScale(sequence[1]) + this.margin.top)
        .attr('width', s => this.barWidth)
        .attr('height', sequence =>
          yScale(sequence[0]) - yScale(sequence[1])
        )
        // Tooltip
        .on('mouseover', () => tooltip.style('display', null))
        .on('mouseout', () => tooltip.style('display', 'none'))
        .on('mousemove', d => {
          const x = d3.mouse(d3.event.currentTarget)[0];
          const y = d3.mouse(d3.event.currentTarget)[1] - 23;

          tooltip.attr('transform', `translate(${x}, ${y})`);
          tooltip.select('text').text(d[1]-d[0]);
        });
    },
  },
};

</script>
