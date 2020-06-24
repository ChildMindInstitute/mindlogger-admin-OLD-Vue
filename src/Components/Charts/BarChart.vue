<template>
    <div class="BarChart">
      <svg :id="plotId">
        <g class="x-axis"/>
        <g class="y-axis"/>
      </svg>
    </div>
</template>


<style>
.BarChart {
    margin: 20px;
    width: fit-content;
    height: fit-content;
}

.BarChart > svg {
    overflow: visible;
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
    features: Array,
  },

  data: () => ({
    width: 200,
    height: 300,
    colors: [
      '#D93C4F',
      '#F46E48',
      '#FDAF5C',
      '#FDDF87',
      '#FEFEBE',
      '#E6F59A',
      '#ABDEA3',
      '#5FC3A9',
      '#2B87C6',
    ],
  }),

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.renderHistogram();
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
    renderHistogram() {
      this.svg = d3.select('#' + this.$options.propsData.plotId);

      this.drawAxes();
      this.plotStackedData();
    },

    /**
     * Draws the axes for the histogram.
     *
     * @return {void}
     */
    drawAxes() {
      const { data } = this.$options.propsData;
      const valueExtent = [-50, 50];
      const dateExtent = d3.extent(data, d => d.date);

      // Scales.
      this.yScale = d3
        .scaleLinear()
        .domain(valueExtent)
        .range([this.height, 0]);
      this.xScale = d3
        .scaleUtc()
        .domain(dateExtent)
        .range([0, this.width]);

      // Axes.
      const xAxis = d3
        .axisBottom()
        .scale(this.xScale)
        // Format the labels
        .ticks(4)
        .tickFormat(d3.timeFormat('%m/%d'));
      const yAxis = d3
        .axisLeft()
        .scale(this.yScale);

      this.svg
        // Append the y-axis.
        .select('.y-axis')
          .attr('transform', `translate(-5, 0)`)
          .call(yAxis)
        // Hide the axis line.
        .select('.domain')
          .attr('stroke-width', 0);

      this.svg
        // Append the x-axis.
        .select('.x-axis')
          .attr('transform', `translate(0, ${this.height})`)
          .call(xAxis)
        // Rotate the x-axis labels.
        .selectAll('text')
          .style('text-anchor', 'end')
          .attr('transform', d => 'rotate(-35)');

        // Hide the axis line.
        this.svg
          .select('.x-axis')
          .select('.domain')
          .attr('stroke-width', 0);
    },

    /**
     * Draws the stacked histogram.
     *
     * @return {void}
     */
    plotStackedData() {
      const { svg, xScale, yScale, colors } = this;
      const { data, features } = this.$options.propsData;
      const stack = d3.stack().keys(features);

      const topLayers = stack(data);
      const bottomLayers = stack(data);

      svg
        // Create one layer per feature.
        .selectAll('.layer')
        .data(topLayers)
        .join('g')
        .attr('class', 'layer')
        .attr('fill', layer => colors[layer.index])
        // Create the individual bars.
        .selectAll('rect')
        .data(layer => layer)
        .join('rect')
        // Set the bar position and dimension.
        .attr('x', sequence => xScale(sequence.data.date))
        .attr('y', sequence => yScale(sequence[1]))
        .attr('width', s => 45)
        .attr('height', sequence => {
          return yScale(sequence[0]) - yScale(sequence[1]);
        });
    },
  },
};

</script>
