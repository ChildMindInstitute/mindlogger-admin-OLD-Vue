<template>
  <div>
    <div
      v-if="format == 'export'"
      class="chart-title"
      :style="`width: ${viewWidth}px;`"
    >
      {{ chartTitle }}
    </div>

    <div
      :is="viewType == 'matrix' ? 'matrix-chart' : 'bar-area-chart'"
      :view-type="viewType"
      :plot-id="plotId"
      :data="frequencyData"
      :features="features"
      :minimum-date="applet.minimumDate"
      :view-width="viewWidth"
      :start-date="options.startDate"
      :end-date="options.endDate"
      :unit="options.unit"
      :range="options.range"
      :selected-feature="options.selectedFeature"
      :format="format"
      @selectFeature="selectFeature"
      @viewDetails="viewDetails"
    />
  </div>
</template>

<style scoped>
.chart-title {
  margin-bottom: 25px;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
}
</style>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import Markdown from '../../Utils/Markdown';
import { DrawingMixin } from '../../Utils/mixins/DrawingMixin';
import { aggregate } from './tokens';

import BarAreaChart from './BarAreaChart.vue';
import MatrixChart from './MatrixChart';

export default {
  name: 'Frequnecy',
  components: {
    BarAreaChart,
    MatrixChart,
    Markdown
  },
  props: {
    plotId: {
      type: String,
      required: true,
    },
    viewType: {
      type: String,
      required: true
    },
    applet: {
      type: Object,
      required: true
    },
    parentWidth: {
      type: Number,
      required: true,
    },
    hasVersionBars: {
      type: Boolean,
      required: true,
    },
    format: {
      type: String,
      required: false,
      default: "view"
    },
    options: {
      type: Object,
      required: true
    }
  },
  data: function() {
    const { features, responses } = this.applet.getTokenResponses();

    return {
      features,
      responses,
    }
  },

  beforeMount() {
    const now = new Date();
    now.setDate(now.getDate()+1)

    const endDate = new Date(moment(now).format('YYYY-MM-DD'));
    const startDate = new Date(endDate.getTime())
    startDate.setDate(startDate.getDate() - 1)

    this.$emit('setOptions', {
      selectedFeature: null,
      startDate,
      endDate,
      unit: 'hour',
      range: '1 day'
    })

    this.data = aggregate(this.features, this.responses, 'hour', startDate, endDate);
  },

  computed: {
    viewWidth() {
      return this.parentWidth - 20;
    },

    chartTitle() {
      let title = '';

      if (this.options.range != 'all') {
        title += this.options.range.replace(/\s/g, '-') + ' ';
      }

      title += `${this.viewType} chart view of behavior frequency`;

      return title;
    },

    frequencyData () {
      return aggregate(this.features, this.responses, this.options.unit, this.options.startDate, this.options.endDate);
    }
  },
  methods: {
    selectFeature(feature) {
      this.$emit('setOptions', {
        ...this.options,
        selectedFeature: feature
      })
    },

    viewDetails({ startDate, endDate, unit, range }) {
      this.$emit('setOptions', {
        selectedFeature: this.options.selectedFeature,
        startDate,
        endDate,
        unit,
        range
      })
    }
  }
}
</script>
