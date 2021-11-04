<template>
  <div>
    <div
      :is="viewType == 'matrix' ? 'matrix-chart' : 'bar-area-chart'"
      :view-type="viewType"
      :plot-id="plotId"
      :data="data"
      :features="features"
      :unit="unit"
      :start-date="startDate"
      :end-date="endDate"
      :minimum-date="applet.minimumDate"
      :view-width="viewWidth"
      :range="range"
      :selected-feature="selectedFeature"
      @selectFeature="selectFeature"
      @viewDetails="viewDetails"
    />
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import { DrawingMixin } from '../Utils/mixins/DrawingMixin';
import { aggregate } from './FrequencyCharts/tokens';

import BarAreaChart from './FrequencyCharts/BarAreaChart.vue';
import MatrixChart from './FrequencyCharts/MatrixChart';
import { features } from 'applet-schema-builder';

export default {
  name: 'Frequnecy',
  components: {
    BarAreaChart,
    MatrixChart,
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
  },
  data: function() {
    const { features, responses } = this.applet.getTokenResponses();
    const now = new Date();
    now.setDate(now.getDate()+1)

    const endDate = new Date(moment(now).format('YYYY-MM-DD'));
    const startDate = new Date(endDate.getTime())
    startDate.setDate(startDate.getDate() - 1)

    return {
      features,
      responses,
      unit: 'hour',
      range: '1 day',
      startDate,
      endDate,
      data: aggregate(features, responses, 'hour', startDate, endDate),
      selectedFeature: null
    }
  },
  computed: {
    viewWidth() {
      return this.parentWidth - 20;
    }
  },
  methods: {
    selectFeature(feature) {
      this.selectedFeature = feature;
    },

    viewDetails({ startDate, endDate, unit, range }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.unit = unit;
      this.range = range;
      this.data = aggregate(this.features, this.responses, unit, startDate, endDate);
    }
  }
}
</script>
