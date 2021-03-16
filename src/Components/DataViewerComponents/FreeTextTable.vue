<template>
  <div
    v-if="itemResponses.length"
    class="mt-4"
  >
    <v-card>
      <v-card-title>
        {{ item.id }}
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="itemResponses"
        :search="search"
      ></v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>

.radio-slider {
  display: inline-block;
  position: relative;
  width: calc(100% - 40px);
  user-select: none;
  margin: 0px 20px;
}

.tooltip {
  z-index: 9999;
  position: absolute;
  max-width: 300px;
  font-size: 14px;
}

</style>

<script>
import * as d3 from 'd3';
import * as moment from 'moment';

export default {
  name: 'FreeTextTable',
  props: {
    responses: {
      type: Array,
      required: true,
    },
    selectedVersions: {
      type: Array,
      required: true,
    },
    item: {
      type: Object,
      required: true
    },
  },
  data: function() {
    return {
      search: '',
      headers: [
        {
          text: 'Date',
          align: 'start',
          sortable: true,
          value: 'date',
        },
        {
          text: 'Time',
          align: 'start',
          sortable: true,
          value: 'time',
        },
        {
          text: 'Response',
          value: 'response',
        },
      ]
    }
  },
  computed: {
    itemResponses() {
      const itemResponses = this.responses.filter(response => this.selectedVersions.includes(response.version));

      return itemResponses.map(response => {
        return {
          date: moment(response.date).format('MM/DD'),
          time: moment(response.date).format('hh:mm A'),
          response: response.value[0],
        }
      });

      return itemResponses;
    }
  },
}
</script>
