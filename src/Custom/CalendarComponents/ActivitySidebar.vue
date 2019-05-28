<template>
  <div>
    <v-card dark :color="color">
      <v-card-title>{{activity.name}}</v-card-title>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'activitysidebar',
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  computed: {
    color() {
      return this.getHexColor(this.activity.color);
    }
  },
  data: () => ({

  }),
  methods: {
    getHexColor(colorname) {
      return _.filter(this.$dayspan.colors, c => c.text === colorname)[0].value;
    }
  }
}
</script>

