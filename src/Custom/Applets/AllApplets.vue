<template>
  <div>
    <Applet v-for="(applet,i) in applets"
    :key="`i${i}`" :applet="applet" v-on:deleteApplet="deleteApplet"
      v-on:refreshApplet="refreshApplet"/>
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
import adminApi from '../Utils/api';

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
      console.log(this.panel)
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
    /**
     * delete an applet
     */
    deleteApplet(applet) {
      console.log('going to delete here', applet);
      adminApi.deleteApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
    /**
     * refresh an applet's activity set
     */
    refreshApplet(applet) {
      adminApi.refreshApplet({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId: applet.applet._id.split('applet/')[1],
      }).then((resp) => {
        console.log(resp);
        this.$emit('refreshAppletList');
      });
    },
  },
  mounted() {
    this.setInitialPanel();
  },
}
</script>

