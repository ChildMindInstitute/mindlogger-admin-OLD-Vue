<template>
    <v-card
      class="card"
      :width="310">
      <v-layout v-if="currentApplet" class="selectedApplet" align-center justify-center column>
        <v-icon size="48">
          check
        </v-icon>
        <v-card-title primary-title>
          <h3 class="headline mb-0">
            {{applet.applet["skos:prefLabel"]}}
          </h3>
        </v-card-title>
      
      </v-layout>

      <div v-else class="unselectedApplet">
        <v-img
          :src="applet.applet['schema:image'] || 'https://picsum.photos/id/83/200/200'"
          width="100%"
          aspect-ratio="1"
          contain
        >
        </v-img>
        <v-card-title primary-title>
          <h3 class="headline mb-0">
            {{applet.applet["skos:prefLabel"]}}
          </h3>
          
        </v-card-title>
        <v-card-text> {{ applet.applet["schema:description"] }} </v-card-text>
        <v-card-actions>
          <v-btn :disabled="status !== 'ready'" @click="refreshApplet">
            <span v-if="status === 'ready'">Refresh</span>
            <span v-else> Refreshing.. </span>
          </v-btn>
          <v-btn @click="deleteApplet">
            Delete
          </v-btn>
          <v-btn @click="setSelectedApplet">
            Select
          </v-btn>
        </v-card-actions>
        </div>
    </v-card>
</template>

<style>
  .card {
    margin: 12px;
  }
  .selectedApplet {
    height: 100%;
    width: 100%;
    align-content: center;
  }
  .unselectedApplet {
    height: 100%
  }
</style>

<script>
export default {
  name: 'Applet',
  props: {
    applet: {
      type: Object,
      required: true,
    },
  },
  computed: {
    currentApplet() {
      if (this.applet == this.$store.state.currentApplet) {
        return true;
      }
      return false;
    }
  },
  data: () => ({
    status: 'ready',
  }),
  watch: {
    // scheduleType() {
    //   if (this.currentApplet) {
    //     // this.$store.commit('setSchedule', { scheduleType: this.scheduleType });
    //   }
    // }
  },
  methods: {
    // select() {
    //   // this.$store.commit('setCurrentApplet', this.applet);
    //   if (!this.applet.schedule) {
    //     // this.applet.schedule = { scheduleType: 'none' };
    //     // this.$store.commit('setSchedule', this.applet.schedule);
    //   }
    // }
    refreshApplet() {
      this.$emit('refreshApplet', this.applet);
    },
    deleteApplet() {
      this.$emit('deleteApplet', this.applet);
    },
    setSelectedApplet() {
      console.log(this.applet);
      this.$store.commit('setCurrentApplet', this.applet);
    }
  },
  created() {

  }
}
</script>

