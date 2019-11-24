<template>
  <v-card
    class="appletCard"
    :width="310"
  >
    <v-layout
      v-if="currentApplet"
      class="selectedApplet"
      align-center
      justify-center
      column
    >
      <v-icon
        size="72"
        color="primary"
      >
        check
      </v-icon>
      <v-card-title primary-title>
        <h3 class="headline mb-0">
          {{ applet.applet["skos:prefLabel"] }}
        </h3>
      </v-card-title>
    </v-layout>

    <div v-else>
      <v-img
        :src="applet.applet['schema:image'] || 'https://picsum.photos/id/83/200/200'"
        width="100%"
        aspect-ratio="1"
        contain
      />
      <v-card-title primary-title>
        <h3 class="headline mb-0">
          {{ applet.applet["skos:prefLabel"] }}
        </h3>
      </v-card-title>
      <v-card-text> {{ applet.applet["schema:description"] }} </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="status !== 'ready'"
          @click="refreshApplet"
        >
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
  .appletCard {
    margin: 12px;
  }
  .selectedApplet {
    height: 100%;
    align-content: center;
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
  data: () => ({
    status: 'ready',
  }),
  computed: {
    currentApplet() {
      return this.applet == this.$store.state.currentApplet;
    }
  },
  methods: {
    refreshApplet() {
      this.$emit('refreshApplet', this.applet);
    },
    deleteApplet() {
      this.$emit('deleteApplet', this.applet);
    },
    setSelectedApplet() {
      console.log(this.applet);
      this.$store.commit('setCurrentApplet', this.applet);
      this.$emit('selectApplet', null);
    },
    
  }
}
</script>
