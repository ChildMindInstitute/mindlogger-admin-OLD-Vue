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
    }
  },
  data: () => ({
    panel: [],
  }),
  computed: {

  },
  methods: {

  },
  mounted() {

  },
}
</script>

