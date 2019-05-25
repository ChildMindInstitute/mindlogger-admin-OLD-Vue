<template>
  <div>
    <v-expansion-panel>
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
  data: () => ({

  }),
  computed: {

  },
  methods: {

  },
  mounted() {

  },
}
</script>

