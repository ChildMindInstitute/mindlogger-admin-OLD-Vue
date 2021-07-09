<template>
  <div
    class="activity-summary"
  >
    <v-list
      v-show="toolTipVisible"
      class="tooltip"
      :style="`left: ${toolTipX}px; top: ${toolTipY}px; width: ${tooltipWidth}px; max-height: ${tooltipHeight}px`"
    >
      <v-list-item
        class="tooltip-item"
        @mousedown="onReviewResponse"
      >
        Review
      </v-list-item>

      <v-list-item
        v-if="currentResponseId"
        class="tooltip-item"
        @mousedown="onShowSubScale"
      >
        Show SubScale Results
      </v-list-item>
    </v-list>

    <div
      v-if="fullActivityName"
      class="tooltip pa-2 tooltip-text"
      :style="`left: ${labelWidth/4}px; top: ${padding.top + radius + 30}px; width: ${tooltipWidth}px; max-height: ${tooltipHeight}px`"
    >
      {{ label }}
    </div>

    <svg
      :id="plotId"
      :height="height"
      width="100%"
      ref="responses"
    >
      <g
        @mouseenter="fullActivityName = true"
        @mouseleave="fullActivityName = false"
        class="labels"
      >
        <text
          :y="padding.top + radius + 15/2"
          :x="labelWidth/2 + 20"
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
        :transform="`translate(${labelWidth + itemPadding + 5}, 0)`"
      >
        <g class="x-axis" />
        <g class="versions" />
        <g
          @click="onClickSVG"
          @mousedown="onClickSVG"
          class="responses"
        />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>

.activity-summary {
  display: inline-block;
  position: relative;
  width: 100%;
  user-select: none;
}

.tooltip {
  border: 1px solid black;
  position: absolute;
  border-radius: 2px;
  padding: 2px;
  background: white;
  z-index: 100;
}

.tooltip-text {
  border-radius: 4px;
  background: black;
  color: white;
  text-align: center;
  opacity: 0.75;
}

.tooltip-item:hover {
  color: rgba(0, 0, 0, 0.7);
  opacity: .7;
}

.tooltip-item {
  text-align: center;
  background-color: #f5f5f5;
}

.tooltip-item:not(:last-child) {
  border-bottom: 1px solid black;
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
    timeRange: {
      type: String,
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
    let currentResponseId = this.subScales.length ? this.subScales[0].current.responseId : null;

    return {
      height: 50,
      margin,
      width,
      labelWidth: width / 4,
      tooltipWidth: 200,
      tooltipHeight: 110,
      currentResponse: null,
      fullActivityName: false,
      currentResponseId,
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
  created() {
    this.onMouseDown = (evt) => {
      const src = evt.srcElement;

      if (this.$refs && this.$refs.responses) {
        if (this.$refs.responses.contains(src) && src.tagName == 'circle') {
          const responseId = src.getAttribute('responseId');

          if (!this.currentResponse || this.currentResponse.responseId != responseId) {
            this.currentResponse = this.data.find(d => d.responseId == responseId);

            this.showReviewingTooltip(
              this.getX(this.currentResponse),
              this.radius + this.padding.top,
              this.labelWidth,
              this.width,
              this.height
            )
          }

          return ;
        }
      }

      if (this.toolTipVisible) {
        this.currentResponse = null;
        this.hideTooltip()
      }
    }

    window.addEventListener('mousedown', this.onMouseDown);
  },
  mounted() {
    this.$nextTick(() => {
      this.render();
    });
  },
  beforeDestroy() {
    window.removeEventListener('mousedown', this.onMouseDown);
  },
  methods: {
    render() {
      this.svg = d3.select('#' + this.plotId);

      this.drawAxes();
      this.drawVersions();
      this.drawResponses();
    },

    getTickType() {
      if (this.timeRange === "Daily") {
        return d3.timeDay.every(2);
      } else if (this.timeRange === "Weekly") {
        return d3.timeWeek;
      } else if (this.timeRange === "Monthly") {
        return d3.timeMonth;
      }
      return d3.timeDay;
    },

    onClickSVG(e) {
      if (this.currentResponse) {
        e.stopPropagation();
      }
    },

    drawAxes() {
      this.x = d3
        .scaleUtc()
        .nice()
        .domain(this.focusExtent)
        .range([0, this.width - this.labelWidth]);

      const tickType = this.getTickType();

      const xAxis = d3
        .axisBottom()
        .scale(this.x)
        .tickSize(this.tickHeight)  // Height of the tick line.
        .ticks(tickType)
        .tickFormat(d => moment(d).format('MMM-D'));

      this.svg
        .select('.x-axis')
        .style('stroke-width', 1.2)
        .style('color', '#373737')
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
        .data(this.data.filter(d => this.selectedVersions.indexOf(d.version) >= 0 && d.date >= this.focusExtent[0] && d.date <= this.focusExtent[1]))
        .join('circle')
        .attr('fill', this.color)
        .attr('cx', d => this.x(d.date))
        .attr('cy', this.radius + this.padding.top)
        .attr('r', d => this.x(d.date) >= 0 ? this.radius : 0)
        .attr('responseId', d => d.responseId)
        .style('outline', d =>
          d.responseId == this.currentResponseId ? 'black auto 5px' : ''
        )
    },

    onReviewResponse() {
      this.$emit('selectResponse', {
        date: this.currentResponse.date.toString(),
        responseId: this.currentResponse.responseId,
      });
    },

    onShowSubScale() {
      this.$emit('showSubScale', {
        responseId: this.currentResponse.responseId
      });

      this.currentResponseId = this.currentResponse.responseId;
      this.render();
    }
  }
}
</script>
