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
          {{ appletPrefLabel }}
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
          {{ appletPrefLabel }}
        </h3>
      </v-card-title>
      <v-card-text> {{ appletDescription }} </v-card-text>
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
    appletPrefLabel() {
      if (typeof this.applet.applet["http://www.w3.org/2004/02/skos/core#prefLabel"] === 'string') {
        return this.applet.applet["http://www.w3.org/2004/02/skos/core#prefLabel"]
      } else if (typeof this.applet.applet["http://www.w3.org/2004/02/skos/core#prefLabel"] === 'object') {
        return this.applet.applet["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
      } else if (typeof this.applet.applet["skos:prefLabel"] === 'string') {
        return this.applet.applet["skos:prefLabel"]
      } else if (typeof this.applet.applet["skos:prefLabel"] === 'object') {
        return this.applet.applet["skos:prefLabel"][0]["@value"];
      } else {
        return null;
      }
    },
    appletDescription() {
      if (typeof this.applet.applet["schema:description"] === 'string') {
        return this.applet.applet["schema:description"];
      } else if (typeof this.applet.applet["schema:description"] === 'object') {
        return this.applet.applet["schema:description"][0]["@value"];
      } else if (typeof this.applet.applet["http://schema.org/description"] === 'string') {
        return this.applet.applet["http://schema.org/description"];
      } else if (typeof this.applet.applet["http://schema.org/description"] === 'object') {
        return this.applet.applet["http://schema.org/description"][0]["@value"];
      } else {
        return null;
      }
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
      this.$router.push('/users');
    },

  }
}
</script>