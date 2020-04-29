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
      @appletUploadSuccessful="onAppletUploadSuccessful"
      @appletUploadError="onAppletUploadError"
    />
    <v-dialog
      v-model="dialog"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Upload Received
        </v-card-title>
        <v-card-text>
          {{ dialogText }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    dialog: false,
    dialogText: '',
    dialogTextDefault: 'The applet is being created. Please check back in several mintutes to see it.',
  }),
  computed: {
    allApplets() {
      return this.$store.state.allApplets;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  mounted() {
    this.getApplets();
  },
  methods: {
    getApplets() {
      this.status = 'loading';
      api.getAppletsForUser({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        user: this.$store.state.auth.user._id,
        role: 'coordinator',
      }).then((resp) => {
        this.$store.commit('setAllApplets', resp.data);
        this.status = 'ready';
        this.$store.commit('updateAllApplets');
      }).catch((e) => {
        this.error = e;
        this.status = 'error';
      });
    },
    onAppletUploadSuccessful(resp) {
      if (resp && resp.data && resp.data.message) {
        this.dialogText = resp.data.message;
      } else {
        this.dialogText = dialogTextDefault;
      }
      this.dialog = true;
    },
    onAppletUploadError() {
      this.dialogText = 'There was an error uploading your applet. Please try again or report the issue.'
      this.dialog = true;
    },
  },
}
</script>
