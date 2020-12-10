<template>
  <div
    class="activity-summary"
    ref="wrapper"
  >
    <svg :id="plotId" :width="width + 20" :height="height + padding.top + padding.bottom">
      <g class="x-axis" />
      <g class="responses" />
      <g class="versions" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.activity-summary {
  display: inline-block;
  position: relative;
  width: calc(100% - 40px);
  user-select: none;
  margin: 40px 20px 20px 20px;
}

</style>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import { DrawingMixin } from '../Utils/mixins/DrawingMixin';

export default {
  name: 'ActivitySummary',
  mixins: [DrawingMixin],
  props: {
    plotId: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      height: 35,
    }
  },
  mounted() {
    const dimensions = this.$refs.wrapper.getBoundingClientRect();
    
    this.render = this.render.bind(this);
    this.width = dimensions.width;

    this.render();
  },

  destroyed() {
    window.addEventListener('resize', this.render);
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
    }
  },
  methods: {
    render() {
      this.svg = d3.select('#' + this.plotId);

      this.drawAxes();
      this.drawResponses();

      this.drawVersions();
    },

    drawAxes() {
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width]);

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(d3.timeDay)
        .tickFormat(d => moment(d).format('MMM D'));

      this.svg
        .select('.x-axis')
        .style('stroke-width', 2)
        .attr('transform', `translate(0, ${this.radius + this.padding.top})`)
        .call(xAxis);
    },

    drawResponses() {
      this.svg
        .select('.responses')
        .selectAll('circle')
        .remove();

      this.svg
        .select('.responses')
        .selectAll('circle')
        .data(this.data.filter(d => this.selectedVersions.indexOf(d.version) >= 0))
        .join('circle')
        .attr('fill', this.color)
        .attr('cx', d => {
          return this.x(d.date);
        })
        .attr('cy', this.radius + this.padding.top)
        .attr('r', this.radius);
    },
  }
}
</script>
