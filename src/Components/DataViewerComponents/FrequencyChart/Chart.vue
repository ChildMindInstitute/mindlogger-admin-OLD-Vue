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
      format="view"
      @selectFeature="selectFeature"
      @viewDetails="viewDetails"
    />

    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="false"
      :paginate-elements-by-height="3000"
      filename="report"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="landscape"
      pdf-content-width="800px"
      :html-to-pdf-options="{
        margin: 70,
        enableLinks: true,
        html2canvas: {
          scale: 1,
          useCORS: true,
        },
        jsPDF: {
          unit: 'pt',
          format: 'a4',
          orientation: 'portrait',
        },
      }"
    >
      <section slot="pdf-content">
        <Markdown
          class="my-4"
          :source="markdown"
        />

        <div
          :is="viewType == 'matrix' ? 'matrix-chart' : 'bar-area-chart'"
          :view-type="viewType"
          :plot-id="`pdf-${plotId}`"
          :data="data"
          :features="features"
          :unit="unit"
          :start-date="startDate"
          :end-date="endDate"
          :minimum-date="applet.minimumDate"
          :view-width="550"
          :range="range"
          :selected-feature="selectedFeature"
          format="export"
        />
      </section>
    </vue-html2pdf>
  </div>
</template>

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
      selectedFeature: null,
      markdown: ''
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
    },

    exportToPdf (markdown) {
      this.markdown = markdown;

      this.$refs.html2Pdf.generatePdf()
    }
  }
}
</script>
