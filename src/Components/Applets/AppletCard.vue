<template>
  <v-card
    class="appletCard"
    :width="cardWidth"
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
        mdi-check
      </v-icon>
      <v-card-title
        primary-title
      >
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
        <div class="container">
          <div>
            <v-btn
              text
              :disabled="status !== 'ready'"
              @click="refreshApplet"
            >
              <span v-if="status === 'ready'">Refresh</span>
              <span v-else> Refreshing.. </span>
            </v-btn>
          </div>
          <div>
            <v-btn
              text
              @click="deleteApplet"
            >
              Delete
            </v-btn>
          </div>
          <div>
            <v-btn
              text
              @click="setSelectedApplet"
            >
              Select
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </div>
  </v-card>
</template>

<style scoped>
  .appletCard {
    margin: 12px;
  }
  .selectedApplet {
    height: 100%;
    align-content: center;
  }
  .container > div {
    display: inline-block;
    display: -moz-inline-box;
    *display: inline;
    zoom: 1;
    width: 33%;
    text-align: center;
  }
</style>

<script>
export default {
  name: 'AppletCard',
  props: {
    applet: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    status: 'ready',
    cardWidth: 300,
  }),
  computed: {
    currentApplet() {
      return this.applet == this.$store.state.currentApplet;
    },
  },
  methods: {
    refreshApplet() {
      this.$emit('refreshApplet', this.applet);
    },
    deleteApplet() {
      this.$emit('deleteApplet', this.applet);
    },
    setSelectedApplet() {
      this.$store.commit('setCurrentApplet', this.applet);
      this.$emit('selectApplet', null);
    },

  }
}
</script>