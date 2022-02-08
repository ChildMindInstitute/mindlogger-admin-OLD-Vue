<template>
  <div>
    <div class="token-header">
      <div class="header-text my-4">You have earned:</div>

      <div class="total-tokens">
        <img :src="require('@/assets/tokens.png')" width="100" />

        <span class="token-number">{{ cumulative.toLocaleString() }}</span>
        <span>total</span>
      </div>

      <div
        v-if="currentInterval"
        class="yesterday-tokens"
      >
        <img :src="require('@/assets/token.png')" width="32" />
        <span class="token-number">{{ pastTokenValue.toLocaleString() }}</span>
        <span>{{pastTokenLabel}}</span>
      </div>
    </div>

    <svg
      v-if="!exportFormat"
      viewBox="0 0 230 50"
      width="100%"
      :height="parentWidth * 43 / 400"
    >
      <defs>
        <filter id="dropShadow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          <feOffset dx="0" dy="1" />
          <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform="translate(-100 -150)">
        <path
          fill="rgb(200, 200, 200)"
          :d="splitPath"
          filter="url(#dropShadow)"
        />
        <path
          :fill="pathColor"
          :d="splitPath"
        />
      </g>
    </svg>

    <div
      class="token-content"
      :class="exportFormat ? 'pdf-export' : ''"
      :style="`width: ${parentWidth}px;`"
    >
      <div class="range-options">
        <div
          v-for="(option, index) in rangeOptions"
          :key="index"
          class="option"
          :class="option == range ? 'selected': ''"
          @click="$emit('setRange', option)"
        >
          {{ option }}
        </div>
      </div>

      <div
        class="token-chart"
      >
        <v-card
          class="tooltip"
          :style="`display: ${tooltip.visible ? 'block' : 'none'}; left: ${tooltip.left}px; top: ${tooltip.top}px;`"
        >
          <span class="label">Cumulative:</span>
          <span class="value">{{ tooltip.cumulative }}</span>
        </v-card>

        <svg
          :id="`token-chart-${plotId}`"
          :width="parentWidth"
          :height="height + axisHeight + 10"
        >
          <polygon
            :fill="fillColor"
            :points="cumulativePolygon"
          />

          <path
            :d="cumulativePath"
            :stroke="pathColor"
            :stroke-width="strokeWidth"
            fill="transparent"
          />

          <circle
            :cx="cumulativePoints[0].x"
            :cy="cumulativePoints[0].y-strokeWidth/2"
            r="7"
            fill="rgb(254, 221, 96)"
          />

          <line
            :x1="padding.left"
            :y1="exportFormat ? axisHeight + height : height"
            :y2="exportFormat ? axisHeight + height : height"
            :x2="width + padding.left"
            stroke="rgb(162, 162, 162)"
            stroke-dasharray="1 2"
          />

          <g class="tick-lines">
            <line
              v-for="(tick, index) in ticks"
              :key="index"
              :x1="tick.x"
              :x2="tick.x"
              :y1="exportFormat ? axisHeight - tickHeight : height"
              :y2="exportFormat ? axisHeight : height + tickHeight"
              stroke="rgb(162, 162, 162)"
              stroke-width="1"
            />
          </g>

          <g
            v-if="range == 'Today'"
            class="responses"
          >
            <template
              v-for="(point, index) in cumulativePoints"
            >
              <template
                v-if="!point.spend"
              >
                <circle
                  :key="`circle-${index}`"
                  :cx="point.x"
                  :cy="exportFormat ? axisHeight + height : height"
                  r="7"
                  :fill="pathColor"
                />

                <polygon
                  :key="`star-${index}`"
                  :points="getStarCoordinates(point.x, exportFormat ? axisHeight + height : height, 5)"
                  fill="white"
                />
              </template>
            </template>
          </g>

          <g class="tick-labels">
            <text
              v-for="(tick, index) in ticks"
              :key="index"
              :x="tick.x"
              :y="exportFormat ? (axisHeight-tickHeight)/2 : height + (axisHeight + tickHeight) / 2"
              text-anchor="middle"
              font-size="15"
              @mouseover="hoverTick(tick)"
              @mouseout="tooltip.visible = false"
            >
              {{ tick.text }}
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.token-header {
  width: 90%;
  margin: auto;
  position: relative;

  .header-text {
    font-size: 22px;
    font-weight: 500;
  }
  .total-tokens, .yesterday-tokens {
    display: flex;
    align-items: flex-end;
    color: rgb(252, 185, 45);
  }

  .total-tokens {
    span {
      padding-bottom: 10px;
      margin-left: 5px;
    }
    .token-number {
      padding-bottom: 0px;
      font-size: 45px;
      font-weight: bold;
    }
  }

  .yesterday-tokens {
    margin-left: 25px;
    span {
      margin-left: 5px;
      font-weight: 500;
      font-size: 18px;
    }
    .token-number {
      font-size: 20px;
      font-weight: bold;
    }
  }
}

.range-options {
  display: flex;
  justify-content: space-around;

  .option {
    cursor: pointer;
    font-weight: bold;

    width: 60px;
    padding: 10px 0px;
    text-align: center;
    border-radius: 5px;
  }

  .option.selected, .option:hover {
    background-color: rgb(254, 221, 96);
  }
}

.token-chart {
  position: relative;
}

.tooltip {
  z-index: 9999;
  position: absolute;
  max-width: 300px;
  font-size: 14px;
  flex-wrap: wrap;
  padding: 15px;
  transform: translateY(-100%) translateX(-50%);
}

.token-content {
  display: flex;
  flex-direction: column;

  &.pdf-export {
    flex-direction: column-reverse;
    margin-top: 40px;

    .range-options {
      margin-bottom: 25px;
    }
  }
}
</style>


<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import Applet from '../../../models/Applet';
import Item from '../../../models/Item';

/**
 * TokenChart component.
 */
export default {
  name: 'TokenChart',
  /**
   * Component properties.
   */
  props: {
    plotId: {
      type: String,
      required: true,
    },
    applet: {
      type: Object,
      required: true,
    },
    hasVersionBars: {
      type: Boolean,
      required: true,
    },
    parentWidth: {
      type: Number,
      required: true,
    },
    range: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: false,
      default: "view"
    }
  },

  data () {
    const now = new Date();
    now.setDate(now.getDate()+1)

    const endDate = new Date(moment(now).format('YYYY-MM-DD'));

    return {
      endDate,
      rangeOptions: [
        'Today',
        '1w',
        '2w',
        '1m',
        '3m',
        '1y',
        'All'
      ],
      height: 250,
      axisHeight: 40,
      tickHeight: 6,
      padding: { left: 40, right: 40 },
      strokeWidth: 4,
      fillColor: 'rgb(254, 239, 180)',
      pathColor: 'rgb(252, 185, 45)',
      tooltip: {
        visible: false,
        left: 0,
        top: 0,
        cumulative: 0
      }
    }
  },

  watch: {
    range () {
      this.endDate = this.getEndDate();
    }
  },

  computed: {
    exportFormat () {
      return this.format == 'export';
    },

    width () {
      return this.parentWidth - this.padding.left - this.padding.right;
    },

    availableIntervals () {
      return [
        { amount: 1, unit: 'days', range: 'Today' },
        { amount: 1, unit: 'weeks', range: '1w' },
        { amount: 2, unit: 'weeks', range: '2w' },
        { amount: 1, unit: 'months', range: '1m' },
        { amount: 3, unit: 'months', range: '3m' },
        { amount: 1, unit: 'year', range: '1y' }
      ]
    },

    currentInterval () {
      return this.availableIntervals.find(iv => iv.range == this.range)
    },

    startDate () {
      const endTime = moment.utc(this.endDate);

      switch (this.range) {
        case 'Today':
          return endTime.subtract(1, 'days').toDate()
        case '1w':
          return endTime.subtract(1, 'weeks').toDate()
        case '2w':
          return endTime.subtract(2, 'weeks').toDate()
        case '1m':
          return endTime.subtract(1, 'months').toDate()
        case '3m':
          return endTime.subtract(3, 'months').toDate()
        case '1y':
          return endTime.subtract(1, 'years').toDate()
      }

      for (const interval of this.availableIntervals) {
        if (endTime.diff(this.applet.minimumDate, interval.unit) < interval.amount) {
          return endTime.subtract(interval.amount, interval.unit).toDate()
        }
      }

      return new Date(`${endTime.format('YYYY-MM')}-01`);
    },

    ticks () {
      const endTime = moment(this.endDate)
      let range = this.range;

      if (range == 'All') {
        range = '1y'

        for (const interval of this.availableIntervals) {
          if (endTime.diff(this.startDate, interval.unit) <= interval.amount ) {
            range = interval.range;
            break;
          }
        }
      }

      let unit = 'months', ticks = [];

      if (range == 'Today') {
        const date = moment.utc(this.startDate).format('YYYY-MM-DD')

        ticks = [
          {
            time: moment.utc(this.startDate),
            text: moment.utc(this.startDate).format('ddd M/DD'),
          },
          { time: moment.utc(`${date} 06:00`, 'YYYY-MM-DD HH:mm'), text: 'Morning' },
          { time: moment.utc(`${date} 12:00`, 'YYYY-MM-DD HH:mm'), text: 'Noon' },
          { time: moment.utc(`${date} 18:00`, 'YYYY-MM-DD HH:mm'), text: 'Evening' },
          {
            time: moment.utc(this.endDate),
            text: moment.utc(this.endDate).format('ddd M/DD'),
          },
        ]
      } else {
        let amount = 1;

        switch (range) {
          case '1w':
            unit = 'days'; amount = 1;
            break;
          case '2w':
            unit = 'days'; amount = 1;
            break;
          case '1m':
            unit = 'days'; amount = 2;
            break;
          case '3m':
            unit = 'weeks'; amount = 1;
            break;
          case '1y':
            unit = 'months'; amount = 1;
            break;
        }

        let tick = moment.utc(this.startDate)

        if (range == '1y') {
          tick = moment.utc(tick.format('YYYY-MM') + '01', 'YYYY-MM-DD')
        }

        while (tick.unix() <= endTime.unix()) {
          if (tick.unix()*1000 >= this.startDate.getTime()) {
            ticks.push({
              time: moment.utc(tick)
            })
          }

          tick = tick.add(amount, unit)
        }

        ticks = ticks.map((tick, index) => {
          let text = tick.time.format(!index || index == ticks.length-1 ? 'MMM DD' : 'MMM');
          if (unit == 'days' || unit == 'weeks') {
            if (
              index == 0 || index == ticks.length-1 || range == '3m'
            ) {
              text = tick.time.format('MMM D');
            } else {
              text = tick.time.format('D');
            }
          }
          return { ...tick, text }
        })
      }

      return ticks.map(tick => ({
        ...tick,
        x: this.getX(tick.time.unix() * 1000)
      }))
    },

    pastTokenLabel() {
      const { range } = this.currentInterval;

      switch (range) {
        case 'Today':
          return 'yesterday';
        case '1w':
          return 'past week';
        case '2w':
          return 'past 2 weeks';
        case '1m':
          return 'past month';
        case '3m':
          return 'past 3 months';
        case '1y':
          return 'past year';
      }

      return '';
    },

    pastTokenValue () {
      const { range } = this.currentInterval;
      const current = new Date(this.endDate);
      const startDate = new Date(this.startDate.getTime());
      let days = 0;

      current.setDate(current.getDate() - 1);
      startDate.setDate(startDate.getDate() - 1);

      switch (range) {
        case 'Today':
          break;
        case '1w': case '2w':
          days = moment.utc(current).day();
          break;
        case '1m': case '3m': case '1y':
          days = 0;
          break;
      }

      current.setDate(current.getDate() - days + 1);
      startDate.setDate(startDate.getDate() - days + 1);

      let tokens = 0;

      for (const change of this.applet.token.changes) {
        if (change.time > startDate.getTime() && change.time < current.getTime()) {
          tokens += change.value;
        }
      }

      return tokens;
    },

    cumulative () {
      return this.applet.token.cumulative
    },

    history () {
      const startTime = this.startDate.getTime();
      const endTime = this.endDate.getTime();

      return this.applet.token.changes
              .filter(({ time }) => time >= startTime && time <= endTime)
    },

    yUnit () {
      let maxCumulative = this.cumulative, current = this.cumulative;

      for (const change of this.applet.token.changes) {
        current -= change.value;

        if (maxCumulative < current) {
          maxCumulative = current;
        }
      }

      return Math.min(25, (this.height - 20) / maxCumulative);
    },

    cumulativePoints () {
      const startTime = this.startDate.getTime();
      const endTime = Math.min(this.endDate.getTime(), new Date().getTime());

      const changes = [
        { time: endTime, value: 0, spend: true },
        ...this.history,
        { time: startTime, value: 0, spend: true },
      ];

      const points = []
      let cumulative = this.cumulative;

      for (const change of this.applet.token.changes) {
        if (change.time > endTime) {
          cumulative = Math.max(0, cumulative-change.value)
        }
      }

      for (let i = 0; i < changes.length; i++) {
        if (changes[i].value) {
          points.push({
            x: this.getX(changes[i].time),
            y: this.height - this.yUnit * cumulative + (this.exportFormat ? this.axisHeight : 0),
            spend: changes[i].spend
          })
        }

        cumulative = Math.max(0, cumulative - changes[i].value);

        points.push({
          x: this.getX(changes[i].time),
          y: this.height - this.yUnit * cumulative + (this.exportFormat ? this.axisHeight : 0),
          spend: changes[i].spend
        })
      }

      return points;
    },

    cumulativePath () {
      const points = this.cumulativePoints;

      return points.map((point, index) => `${!index ? 'M' : 'L'} ${point.x} ${point.y - this.strokeWidth/2}`).join(' ')
    },

    cumulativePolygon () {
      const points = [...this.cumulativePoints];

      const endTime = Math.min(this.endDate.getTime(), new Date().getTime());

      points.push({
        x: this.getX(this.startDate.getTime()),
        y: this.height + (this.exportFormat ? this.axisHeight : 0)
      })

      points.push({
        x: this.getX(endTime),
        y: this.height + (this.exportFormat ? this.axisHeight : 0)
      })

      return points.map(({ x, y }) => `${x}, ${y}`).join(' ')
    },

    splitPath () {
      return `M425.511,153s-55.746,35.923-214.418,21.194S-2.489,191.822-2.489,191.822v-6.975s61.207-31.01,213.582-13.805,214.418-21.707,214.418-21.707Z`;
    }
  },

  mounted () {
    this.endDate = this.getEndDate();
  },

  methods: {
    hoverTick (tick) {
      const index = this.ticks.indexOf(tick)
      const startTime = tick.time.unix() * 1000;
      const endTime = startTime + 86400 * 1000;

      let tokens = 0;

      for (const change of this.applet.token.changes) {
        if (change.time < endTime && change.time > startTime) {
          tokens += change.value;
        }
      }

      this.tooltip = {
        visible: true,
        cumulative: tokens,
        left: tick.x,
        top: this.height - 5
      }
    },

    getStarCoordinates (cx, cy, r) {
      const diff = 144 / 180 * Math.PI;
      const points = [];

      for (let i = 0; i < 5; i++) {
        const angle = Math.PI/2 - diff * i;
        points.push({ x: Math.cos(angle) * r + cx, y: Math.sin(angle) * r + cy })
      }

      return points.map(({x, y}) => `${x}, ${y}`).join(' ')
    },

    getX (time) {
      const startTime = this.startDate.getTime();
      const endTime = this.endDate.getTime();

      return this.width * (time - startTime) / (endTime - startTime) + this.padding.left;
    },

    getEndDate () {
      const endDate = new Date(moment(new Date()).format('YYYY/MM/DD'));

      switch (this.range) {
        case 'Today': case 'All':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case '1w': case '2w':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case '1m': case '3m':
          endDate.setDate(1);
          break;
        case '1y':
          endDate.setDate(1); endDate.setMonth(0);
          break;
      }

      return new Date(moment(endDate).format('YYYY-MM-DD'));
    }
  },
};
</script>
