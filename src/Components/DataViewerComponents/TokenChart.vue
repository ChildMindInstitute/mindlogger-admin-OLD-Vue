<template>
  <div>
    Token Chart
  </div>
</template>

<style lang="scss">
</style>


<script>
import * as d3 from 'd3';
import * as moment from 'moment';
import Applet from '../../models/Applet';
import Item from '../../models/Item';

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
    }
  },
  data: function() {
    return {
    }
  },
  computed: {
    cumulativeToken() {
      return this.cumulative.cumulativeToken;
    },
    tokenUpdates() {
      return this.cumulative.tokenUpdates.map(tokenUpdate => ({
        date: new Date(tokenUpdate.created.slice(0, 10)),
        value: tokenUpdate.value
      }))
    }
  },

  /**
   * Handlers to be executed each time a property changes its value.
   */
  watch: {
    hasVersionBars: {
      deep: false,
      handler() {
        this.render();
      }
    },
    parentWidth: {
      deep: false,
      handler(newValue) {
        this.render();
      }
    }
  },

  /**
   * Method to be executed after the component has been mounted.
   *
   * @return {void}
   */
  mounted() {
    this.render = this.render.bind(this);
    this.$nextTick(() => {
      this.render();
    });
  },
  /**
   * Component methods.
   */
  methods: {
    render () {

    }
  },
};
</script>
