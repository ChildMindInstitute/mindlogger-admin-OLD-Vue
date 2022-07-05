<template>
  <div>
    <v-card
      class="d-flex align-center"
      dark
      :color="color"
    >
      <img 
        v-if="activity.isActivityFlow"
        class="ml-2"
        width="18"
        height="15"
        :src="require('@/assets/activity-flow-bg.svg')" 
      />
      <v-card-text 
        class="name pa-2"
      >
        {{ activity.name }}
      </v-card-text>
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

