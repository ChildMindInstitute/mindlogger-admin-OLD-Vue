<template>
  <div class="picker">
    <div
      class="content"
      :style="`top: ${center}px;`"
    >
      <v-menu
        offset-y
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            class="range-selector"
            icon
          >
            <v-icon class="triangle-right" color="grey">
              mdi-triangle
            </v-icon>
          </v-btn>
        </template>
        <div class="option-list">
          <v-radio-group
            :value="range"
            @change="onChangeRange"
          >
            <v-radio
              v-for="option in rangeOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </v-radio-group>
        </div>
      </v-menu>
      <v-menu
        offset-y
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            class="date-range"
            v-bind="attrs"
            v-on="on"
          >
            <svg @click="upRange">
              <polygon points="0, 10 45, 10 22, 0" fill="rgb(128, 128, 128)" />
            </svg>
            <div
              v-for="(str, index) in dateRangeStr"
              :key="index"
            >
              {{ str }}
            </div>
            <svg @click="downRange">
              <polygon points="0, 0 45, 0 22, 10" fill="rgb(128, 128, 128)" />
            </svg>
          </div>
        </template>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>

.picker {
  width: 100px;
}

.content {
  position: relative;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.content .date-range {
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.date-range svg {
  width: 45px;
  height: 10px;
  opacity: 0;
  transition: opacity .2s;
}

.date-range:hover svg {
  opacity: 1;
}

.date-range svg:hover {
  opacity: 0.7;
}

.triangle-right {
  transform: rotate(90deg);
}
.option-list {
  background: white;
  padding: 5px 25px;
}

.range-selector {
  transition: transform .2s;
}
.range-selector[aria-expanded="true"] {
  transform: rotate(90deg) !important;
}
</style>

<script>
import * as moment from 'moment';

export default {
  props: {
    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    minimumDate: {
      type: Date,
      required: true
    },

    unit: {
      type: String,
      required: true
    },

    range: {
      type: String,
      required: true
    },

    center: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      rangeOptions: [
        '1 day',
        '1 week',
        '2 weeks',
        '1 month',
        '6 months',
        '1 year',
        'All'
      ],
    }
  },

  computed: {
    dateRangeStr () {
      const startTime = moment.utc(this.startDate);
      const endTime = moment.utc(this.endDate);

      switch (this.range) {
        case '1 day':
          return [
            startTime.format('MMM DD'),
            startTime.format('YYYY')
          ]

        case '1 week': case '2 weeks':
          if (this.startDate.getMonth() == this.endDate.getMonth()) {
            return [
              startTime.format('MMM'),
              startTime.format('DD') + '-' + endTime.subtract(1, 'days').format('DD')
            ]
          }

          return [
            startTime.format('MMM DD'),
            '-',
            endTime.subtract(1, 'days').format('MMM DD')
          ]

        case '1 month':
          return [
            startTime.format('MMM'),
            startTime.format('YYYY')
          ]

        case '6 months':
          return [
            startTime.format('MMM YYYY'),
            '-',
            endTime.subtract(1, 'days').format('MMM YYYY')
          ]

        case '1 year':
          return [startTime.format('YYYY')]
      }

      return [
        startTime.format('MMM DD YYYY'),
        '-',
        endTime.format('MMM DD YYYY')
      ]
    },
  },

  methods: {
    changeDate (date, diff, add=false) {
      const obj = moment.utc(date);
      const operate = add ? obj.add.bind(obj) : obj.subtract.bind(obj);

      switch (diff) {
        case '1 day':
          return operate(1, 'days').toDate()
        case '1 week':
          return operate(1, 'weeks').toDate()
        case '2 weeks':
          return operate(2, 'weeks').toDate()
        case '1 month':
          return operate(1, 'months').toDate()
        case '6 months':
          return operate(6, 'months').toDate()
        case '1 year':
          return operate(1, 'years').toDate()
      }

      return date;
    },

    upRange () {
      if (this.range != 'All') {
        const startDate = this.changeDate(this.startDate, this.range, true)
        const endDate = this.changeDate(this.endDate, this.range, true)

        this.$emit('viewDetails', {
          startDate,
          endDate,
          unit: this.unit,
          range: this.range
        })
      }
    },

    downRange () {
      if (this.range != 'All') {
        const startDate = this.changeDate(this.startDate, this.range, false)
        const endDate = this.changeDate(this.endDate, this.range, false)

        this.$emit('viewDetails', {
          startDate,
          endDate,
          unit: this.unit,
          range: this.range
        })
      }
    },

    onChangeRange (range) {
      const now = new Date();
      now.setDate(now.getDate() + 1)
      let endDate = new Date(moment(now).format('YYYY-MM-DD'));
      let startDate, unit = 'hour';

      if (range == '1 month' || range == '6 months') {
        endDate = new Date(moment.utc(endDate).format('YYYY-MM') + '-01');
      } else if (range == '1 year') {
        endDate = new Date(moment.utc(endDate).format('YYYY') + '-01-01');
      }

      if (range == 'All') {
        startDate = this.minimumDate;

        if (moment(endDate).diff(startDate, 'days') <= 1) {
          startDate = moment(endDate).subtract(1, 'days').toDate()
        } else if (moment(endDate).diff(startDate, 'weeks') <= 1) {
          startDate = moment(endDate).subtract(1, 'weeks').toDate()
        }
      } else {
        startDate = this.changeDate(endDate, range, false)
      }

      if (moment(endDate).diff(startDate, 'days') <= 1) {
        unit = 'hour'
      } else if (moment(endDate).diff(startDate, 'months') <= 1) {
        unit = 'day'
      } else {
        unit = 'month'
      }

      this.$emit('viewDetails', {
        startDate, endDate, unit, range
      })
    }
  }
}
</script>
