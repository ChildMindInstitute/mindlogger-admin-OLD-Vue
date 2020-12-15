<template>
  <div
    class="radio-slider"
  >
    <svg :id="plotId" :width="width + 20" :height="height + padding.top + padding.bottom">
      <g class="x-axis" />
      <g class="responses" />
      <g class="versions" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.radio-slider {
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
  name: 'RadioSlider',
  mixins: [DrawingMixin],
  props: {
    plotId: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true
    },
  },
  data: function() {
    return {
      height: 35,
      width: this.parentWidth - 60,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.render();
    });
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
        this.width = newValue - 60;
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

    },

    drawVersions() {
      this.svg
        .select('.versions')
        .selectAll('rect')
        .remove();

      if (!this.hasVersionBars) {
        return;
      }

      this.svg
        .select('.versions')
        .selectAll('rect')
        .data(this.versions.filter(d => this.selectedVersions.indexOf(d.version) >= 0 ))
        .join('rect')
        .attr('fill', d => d.barColor)
        .attr('x', d => {
          return this.x(new Date(d.updated));
        })
        .attr('y', 0)
        .attr('width', this.versionBarWidth)
        .attr('height', this.height + this.padding.top + this.padding.bottom);
    }
  }
}
</script>
