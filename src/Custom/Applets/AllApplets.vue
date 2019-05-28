<template>
  <div>
    <v-expansion-panel v-model="panel">
      <v-expansion-panel-content
        v-for="(applet,i) in applets"
        :key="`i${i}`"
      >
        <template slot="header">
          <h3>{{applet.applet["skos:prefLabel"]}}</h3>
        </template>
        <Applet :applet="applet" />
      </v-expansion-panel-content>
    </v-expansion-panel>

  </div>
</template>

<style>
  .spaced {
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }
</style>

<script>
import _ from 'lodash';
import Applet from './Applet';

export default {
  name: 'AllApplets',
  props: {
    applets: {
      type: Array,
      required: true,
    }
  },
  components: {
    Applet,
  },
  watch: {
    panel() {
      this.$emit('selected_applet', this.panel);
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  data: () => ({
    panel: [],
  }),
  computed: {

  },
  methods: {
    setInitialPanel() {
      const idx = _.findIndex(this.$store.state.allApplets, (a) => {
        return a.applet['schema:description'] == this.$store.state.currentApplet.applet['schema:description'];
      });
      if (idx > -1) {
        this.panel = idx;
      }
    },
  },
  mounted() {
    this.setInitialPanel();
  },
}
</script>

