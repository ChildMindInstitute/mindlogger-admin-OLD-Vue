import * as moment from 'moment';
import axios from 'axios';

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
  data: function () {
    return {
      padding: {
        top: 10,
        bottom: 10,
      },
      versionBarWidth: 2,
      radius: 10,
      tickHeight: 6,
      tickWidth: 6,

      toolTipVisible: false,
      toolTipX: 0,
      toolTipY: 0,
      tooltipWidth: 350,
      tooltipHeight: 120,
      outputText: '',
      cachedContents: {}
    }
  },
  computed: {
    versionsLength() {
      const versionsLength = {};
      this.versions.forEach(version => {
        if (version.updated) {
          const updatedDay = new Date(version.updated).getDay();
          versionsLength[updatedDay] = versionsLength[updatedDay]
            ? versionsLength[updatedDay] + 1
            : 2;
        }
      });

      return versionsLength;
    },
    formattedVersions() {
      let offset = `${this.timezone[0] === '+' ? '-' : '+'}${this.timezone.substr(1)}`;
      let timeZoneIndex = new Date().getTimezoneOffset() / (-60);
      let versionHours = 24;

      return this.versions.map(version => {
        if (!version.updated) {
          return version;
        }

        const hour = 24 / this.versionsLength[new Date(version.updated).getDay()];
        const formatted = new Date(version.updated.slice(0, -6) + offset);
        const versionDate = new Date(formatted).setHours(versionHours - hour + timeZoneIndex, 0, 1);
        versionHours = (versionHours === hour * 2) ? 24 : versionHours - hour;

        const formattedDate = new Date(versionDate).toISOString();
        return {
          version: version.version,
          barColor: version.barColor || "#000000",
          updated: new Date(formattedDate.slice(0, -5))
        }
      })
    }
  },
  methods: {
    getX(d) {
      let responseDate = new Date(d.date);

      const dataVersion = this.formattedVersions.find(v => v.version === d.version );

      if (dataVersion.updated) {
        const offset = this.versionsLength[new Date(dataVersion.updated).getDay()] / 2;
        responseDate = new Date(d.date).setHours(new Date (dataVersion.updated).getHours() + offset);
      }
      return this.x(responseDate);
    },

    drawVersions() {
      this.svg
        .select('.versions')
        .selectAll('rect')
        .remove();

      if (!this.hasVersionBars) {
        return;
      }

      const newVersions = this.formattedVersions.filter(d => this.selectedVersions.indexOf(d.version) >= 0 && d.updated);

      this.svg
        .select('.versions')
        .selectAll('rect')
        .data(newVersions)
        .join('rect')
        .attr('fill', d => d.barColor)
        .attr('x', d => {
          return this.x(d.updated);
        })
        .attr('y', 0)
        .attr('width', this.versionBarWidth)
        .attr('height', d => {
          return this.x(d.updated) >= 0 ? this.height + this.padding.top + this.padding.bottom : 0
        })

      this.svg
        .select('.versions')
        .selectAll('text')
        .data(newVersions)
        .join("text")
        .attr('x', d => {
          return this.x(d.updated) + 3;
        })
        .attr('y', 8)
        .style("font-size", "10px")
        .text(d => "v" + d.version);

    },

    getChartHeight(width) {
      return width >= 1024 ? 250 : width >= 768 ? 200 : 150;
    },

    showTooltip(x, y, value, labelWidth, width, height) {
      this.toolTipVisible = true;

      this.outputText = value.outputText;

      /** getting output text */
      if (!this.cachedContents[this.outputText]) {
        const output = this.outputText;

        if (output.startsWith('http://') || output.startsWith('https://')) {
            axios({
              method: 'GET',
              url: output,
            })
            .then(resp =>
              this.$set(this.cachedContents, output, resp.data)
            )
            .catch(() => {
              this.$set(this.cachedContents, output, output);
            })
        } else {
          this.$set(this.cachedContents, output, output);
        }
      }

      /** getting coordination of tooltip */
      x = x + labelWidth;
      y = y + 10;

      if (y + this.tooltipHeight > height) {
        y = height - this.tooltipHeight - 10;
      }
      if (x + this.tooltipWidth + 10 > width) {
        x = x - this.tooltipWidth - 10;
      }

      this.toolTipX = x;
      this.toolTipY = y;
    },

    hideTooltip() {
      this.toolTipVisible = false;
    }
  }
}
