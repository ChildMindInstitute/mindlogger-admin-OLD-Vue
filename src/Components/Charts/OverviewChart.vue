<template>
    <div class="OverviewChart" ref="container">
      <svg id="overview-chart">
        <g class="x-axis"/>
        <g class="y-axis"/>
        <g class="chart"/>
      </svg>
    </div>
</template>


<style>
.OverviewChart > svg {
  display: block;
}

.OverviewChart .y-axis .tick line {
  stroke: #8A8A8A !important;
  stroke-width: 0.5;
}

.OverviewChart .y-axis .domain {
  stroke-width: 0;
}

.OverviewChart .y-axis text {
  transform: translate(-60px, 0) !important;
  font-size: 12px;
  color: #444;
}


.OverviewChart .x-axis .tick line {
  stroke: #AAA !important;
  stroke-dasharray: 3;
  stroke-width: 0.5;
}

.OverviewChart .x-axis .domain {
  stroke-width: 0;
}

.OverviewChart .x-axis .tick text {
  color: #555;
}

</style>


<script>
import * as d3 from 'd3';


export default {
  name: 'OverviewChart',

  /**
   * Component properties.
   */
  props: {
    features: Array,
    data: Array,
  },

  /**
   * Component data.
   */
  data: () => ({
    margin: {
      top: 30,
      right: 30,
      bottom: 50,
      left: 140,
    },
  }),

  /**
   * Computed properties.
   */
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
    barWidth() {
      return this.width / this.daysCount - 8 ;
    }
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
   * Component private methods.
   */
  methods: {
    /**
     * Renders the overview chart.
     *
     * @return {void}
     */
    render() {
      this.svg = d3.select('#overview-chart');

      this.setLayout();
      this.renderAxes();
      this.renderData();
    },

    setLayout() {
      const dimensions = this.$refs.container.getBoundingClientRect();
      this.width = dimensions.width - this.margin.left - this.margin.right;
      this.height = dimensions.height - this.margin.top - this.margin.bottom;

      // Set dimensions.
      this.svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      // Add margin.
      this.svg
        .append('g')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${this.margin.top})`,
        );
    },

    renderAxes() {
      const dateExtent = d3.extent(this.data, d => {
        d.date.setHours(0);
        d.date.setMinutes(0);
        d.date.setSeconds(0);
        return d.date;
      });

      // X-axis scale.
      this.x = d3
        .scaleTime()
        .domain(dateExtent)
        .nice()
        .range([0, this.width]);

      this.svg
        .select('.x-axis')
        .remove();

      this.svg
        .select('.y-axis')
        .remove();

      // Append it to the SVG.
      this.svg
        .append('g')
        .attr('class', 'x-axis')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${this.height + this.margin.top})`
        )
        .call(
          d3
            .axisBottom(this.x)
            .ticks(this.daysCount)
            .tickSize(-this.height)
            .tickFormat(d => d.toLocaleDateString(
              'default',
              { day: 'numeric', month: 'short' },
            ))
        )
        // Rotate the x-axis labels.
        .selectAll('text')
        .style('text-anchor', 'center')
        .attr('transform', d => `translate(-10, 25) rotate(-65)`);

      // Y-axis scale.
      this.y = d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.features);

      // Append it to the SVG.
      this.svg
        .append('g')
        .attr('class', 'y-axis')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${this.margin.top})`
        )
        .call(
          d3
            .axisLeft(this.y)
            .tickSize(-this.width)
        );

      this.svg
        .selectAll('.y-axis text')
        .attr('width', 120)
        .style('text-anchor', 'middle');

      this.svg
        .select('.y-axis')
        .insert('rect', 'g')
        .attr('ry', 18)
        .attr('rx', 18)
        .attr('width', 120)
        .attr('height', 36)
        .attr('transform', 'translate(-130, 18)')
        .style('fill', '#F0F0F0');
    },

    renderData() {
      this.svg
        .selectAll('.chart rect')
        .remove();

      this.svg
        .select('.chart')
        .selectAll('.entry')
        .data(this.data, d => d.activity + ':' + d.date)
        .enter()
        .append('rect')
        .attr('x', d => this.margin.left + this.x(d.date) - 4)
        .attr('y', d => this.y(d.activity) + this.margin.top + 30)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', '#757575');
    },
  },
};
</script>

