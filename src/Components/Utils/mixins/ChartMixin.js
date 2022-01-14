import * as moment from 'moment';

export const ChartMixin = {
  props: {
    plotId: {
      type: String,
      required: true
    },
    features: {
      type: Array,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    minimumDate: {
      type: Date,
      required: true
    },
    viewWidth: {
      type: Number,
      required: true
    },
    viewType: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
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
    selectedFeature: {
      type: Object,
      required: false,
      default: null
    },
  },

  data() {
    return {
      padding: {
        top: 10,
        bottom: 10,
      },
    }
  },

  computed: {
    width () {
      return this.viewWidth - 100
    },

    labelWidth () {
      if ((this.viewType == 'area' || this.viewType == 'bar') && this.format == 'export') {
        return 0;
      }

      return this.width / 4;
    },

    positiveOptions () {
      return this.features.filter(feature => feature.value >= 0)
    },

    negativeOptions () {
      return this.features.filter(feature => feature.value < 0)
    },

    xUnit () {
      return (this.width - this.labelWidth) / this.data.frequency.length;
    },

    maxFrequency () {
      let max = 1;

      for (const freq of this.data.frequency) {
        for (const option of this.features) {
          max = Math.max(max, (freq[option.id] || 0))
        }
      }

      return max;
    },

    yScale () {
      if (this.viewType == 'matrix') {
        return [
          -this.negativeOptions.length,
          this.positiveOptions.length
        ]
      }

      let min = 1e6, max = -1e6;

      for (const freq of this.data.frequency) {
        const start = 0, end = 0;
        for (const option of this.negativeOptions) {
          start -= freq[option.id]
        }

        for (const option of this.positiveOptions) {
          end += freq[option.id]
        }

        min = Math.min(min, start)
        max = Math.max(max, end)
      }

      return [min, max]
    },
  },
  methods: {
    backToOriginalView () {
      if (this.unit == '5mins') {
        const start = new Date(moment.utc(this.startDate).format('YYYY-MM-DD'));
        const end = new Date(start.getTime())
        end.setDate(end.getDate() + 1);

        this.$emit('viewDetails', {
          startDate: start,
          endDate: end,
          unit: 'hour',
          range: this.range
        });
      }

      if (this.selectedFeature) {
        this.$emit('selectFeature', null);
      }
    },

    xTick (date) {
      const time = moment.utc(date)

      switch (this.unit) {
        case '5mins':
          return time.format('HH:mm')
        case 'hour':
          return time.format('HH')
        case 'day':
          return time.format('DD')
        case 'week':
          return time.format('MMM/DD')
        case 'month':
          return time.format('MMM')
      }

      return time.format('MM/DD')
    },

    getWeekDay(date) {
      if (this.unit === 'day') {
        return moment.utc(date).format('ddd')
      }

      return '';
    },

    compressedName (name) {
      if (this.format == 'export') {
        return name.length >= 12 ? name.slice(0, 9) + '...' : name
      }

      return name.length > 30
        ? name.slice(0, 26) + ' …'
        : name
    },

    viewDetails (frequency) {
      if (this.unit == 'hour') {
        this.$emit('viewDetails', {
          startDate: frequency.start,
          endDate: frequency.end,
          unit: '5mins',
          range: this.range
        })
      }
    },
  }
}
