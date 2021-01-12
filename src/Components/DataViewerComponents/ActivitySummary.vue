<template>
  <div
    class="activity-summary"
  >
    <svg
      :id="plotId"
      :width="width"
      :height="height"
    >
      <g class="labels">
        <text
          :y="padding.top + radius + 15/2"
          :x="labelWidth/2"
          :font-size="itemPadding"
          text-anchor="middle"
          font-weight="bold"
        >
          {{ compressedLabel }}
        </text>

        <template
          v-if="subScales.length"
        >
          <text
            :y="padding.top + radius + 16/2 + 16"
            :x="labelWidth/2"
            :font-size="10"
            text-anchor="middle"
            font-weight="bold"
          >
            ( {{$t('latestScore')}}: {{ latestScore }}, {{$t('frequency')}}: {{ frequency }} )
          </text>
        </template>
      </g>

      <g
        class="content"
        :transform="`translate(${labelWidth + itemPadding - 20}, 0)`"
      >
        <g class="x-axis" />
        <g class="versions" />
        <g class="responses" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.activity-summary {
  display: inline-block;
  position: relative;
  user-select: none;
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
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    itemPadding: {
      type: Number,
      required: true,
    },
    latestScore: {
      type: Number,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
    subScales: {
      type: Array,
      required: true,
    }
  },
  data: function() {
    let margin = { left: 20, right: 60 };
    let width = this.parentWidth - margin.left - margin.right;

    return {
      height: 50,
      margin,
      width,
      labelWidth: width / 4,
    }
  },
  computed: {
    compressedLabel() {
      return this.label.length > 28
        ? this.label.slice(0, 25) + ' …'
        : this.label
    }
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
        this.width = newValue - this.margin.left - this.margin.right;
        this.labelWidth = this.width / 4;
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
      this.drawVersions();
      this.drawResponses();
    },

    drawAxes() {
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width - this.labelWidth]);

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(d3.timeDay)
        .tickFormat(d => moment(d).format('MMM-D'));

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
        .attr('r', d => this.x(d.date) >= 0 ? this.radius : 0);
    },
  }
}
</script>
