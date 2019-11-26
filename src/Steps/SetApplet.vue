<template>
  <v-container fluid>
    <Loading v-if="status === 'loading'" />
    <div
      v-else-if="status === 'error'"
      class="error"
    >
      {{ error.message }}
    </div>
    <AllApplets
      v-else
      :applets="allApplets"
      @refreshAppletList="getApplets"
    />
  </v-container>
</template>

<script>
import api from '../Components/Utils/api/api.vue';
import _ from 'lodash';
import AllApplets from '../Components/Applets/AllApplets';
import Loading from '../Components/Utils/Loading';
import { Parse, Day } from 'dayspan';
import config from '../config';

window.Parse = Parse;
window.Day = Day;

export default {
  name: 'Applet',
  components: {
    AllApplets,
    Loading,
  },
  data: () => ({
    sampleProtocols: config.protocols,
    error: {},
    status: 'loading',
  }),
  computed: {
    allApplets() {
      return this.$store.state.allApplets;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    isLoggedIn() {
      return !_.isEmpty(this.$store.state.auth);
    },
    readyToContinue() {
      return !_.isEmpty(this.currentApplet);
    },
  },
  watch: {
    isLoggedIn() {
      if (this.isLoggedIn) {
        this.getApplets();
      }
    },
  },
  mounted() {
    if (this.isLoggedIn) {
      this.getApplets();
    }
  },
  methods: {
    getApplets() {
      this.status = 'loading';
      api.getAppletsForUser({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        user: this.$store.state.auth.user._id,
        role: 'manager',
      }).then((resp) => {
        this.$store.commit('setAllApplets', resp.data);
        this.status = 'ready';
      }).catch((e) => {
        this.error = e;
        this.status = 'error';
      });
    },
    continueAction() {

    },
  },
}
</script>
