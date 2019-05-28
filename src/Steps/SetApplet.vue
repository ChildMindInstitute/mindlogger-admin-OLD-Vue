<template>
  <div>
    <div v-if="isLoggedIn">
      <h1>Your Applets</h1>
      <div v-if="status === 'loading'">
        refreshing...
      </div>
      <div v-else-if="status === 'error'" class="error">
        {{error.message}}
      </div>
      <div style="margin-top: 2em;">
        <h3>Create a new applet:</h3>
        <v-text-field
          label="activity set url"
          v-model="newAppletURL"
        ></v-text-field>
        <v-btn color="success" :disabled="!newAppletURL">Add</v-btn>
      </div>
      <div style="margin-top: 3em;">
        <h3 style="margin-bottom: 1.5em;">Or select an existing applet:</h3>
        <AllApplets :applets="allApplets" v-on:selected_applet="setSelectedApplet"/>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@bit/akeshavan.mindlogger-web.api';
import _ from 'lodash';
import AllApplets from '../Custom/Applets/AllApplets';

export default {
  name: 'Applet',
  data: () => ({
    error: {},
    status: 'loading',
    newAppletURL: '',
  }),
  components: {
    AllApplets,
  },
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
    setSelectedApplet(appletIdx) {
      this.$store.commit('setCurrentApplet', this.$store.state.allApplets[appletIdx]);
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.getApplets();
    }
  },
}
</script>

