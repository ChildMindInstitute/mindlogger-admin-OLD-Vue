export const DrawingMixin = { 
  props: {
    focusExtent: {
      type: Array,
      required: true
    },
    color: {
      type: String,
      required: false,
      default: '#8076B2'
    },
    versions: {
      type: Array,
      required: true,
    },
    hasVersionBars: {
      type: Boolean,
      required: true,
    },
    selectedVersions: {
      type: Array,
      required: true,
    },
    parentWidth: {
      type: Number,
      required: true,
    }
  },
  data: function() {
    return {
      padding: {
        top: 10,
        bottom: 10,
      },
      versionBarWidth: 2,
      radius: 7,
      tickHeight: 6,
    }
  },
  methods: {
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
