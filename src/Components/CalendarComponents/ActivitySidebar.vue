<template>
  <div>
    <v-card
      dark
      :color="color"
    >
      <v-card-title class="name">{{ activity.name }}</v-card-title>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'Activitysidebar',
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  data: () => ({

  }),
  computed: {
    color() {
      return this.getHexColor(this.activity.color);
    }
  },
  methods: {
    getHexColor(colorname) {
      return _.filter(this.$dayspan.colors, c => c.text === colorname)[0].value;
    }
  }
}
</script>

<style scoped>
  .name {
    word-break: normal;
  }
</style>

