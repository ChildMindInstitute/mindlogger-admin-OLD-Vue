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
    dialog: true,
    dialogText: '',
    dialogTextDefault: 'The applet is being created. Please check back in several mintutes to see it. If you have an email address associated with your account, you will receive an email when your applet is ready.',
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
    continueAction() {

    },
  },
}
</script>
