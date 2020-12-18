import * as moment from 'moment';

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
    },
    timezone: {
      type: String,
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
  computed: {
    formattedVersions() {
      let offset = `${this.timezone[0] === '+' ? '-' : '+'}${this.timezone.substr(1)}`;
      return this.versions.map(version => {
        if (!version.updated) {
          return version;
        }

        const formatted = new Date(version.updated.slice(0, -6) + offset).toISOString();
        return {
          version: version.version,
          barColor: version.barColor,
          updated: new Date(formatted.slice(0, -5))
        }
      })
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
        .data(this.formattedVersions.filter(d => this.selectedVersions.indexOf(d.version) >= 0 ))
        .join('rect')
        .attr('fill', d => d.barColor)
        .attr('x', d => {
          return this.x(d.updated);
        })
        .attr('y', 0)
        .attr('width', this.versionBarWidth)
        .attr('height', d => {
          return this.x(d.updated) >= 0 ? this.height + this.padding.top + this.padding.bottom : 0
        });
    },
  }
}
