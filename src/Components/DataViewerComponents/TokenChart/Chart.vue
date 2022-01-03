<template>
  <div>
    <Graph
      :plot-id="plotId"
      :applet="applet"
      :parent-width="parentWidth"
      :has-version-bars="hasVersionBars"
      :range="range"
      @set-range="setRange"
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

        <Graph
          :plot-id="`pdf-${plotId}`"
          :applet="applet"
          :parent-width="600"
          :has-version-bars="hasVersionBars"
          :range="range"
          :export-format="true"
        />
      </section>
    </vue-html2pdf>
  </div>
</template>


<script>
import Markdown from '../../Utils/Markdown';
import Graph from './Graph.vue';
export default {
  name: 'TokenChart',
  components: {
    Graph,
    Markdown
  },
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
    }
  },
  data () {
    return {
      range: '1w',
      markdown: ''
    }
  },

  methods: {
    setRange (range) {
      this.range = range;
    },

    exportToPdf (markdown) {
      this.markdown = markdown;

      this.$refs.html2Pdf.generatePdf()
    }
  }
};
</script>
