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
      @refreshAppletList="getAccountData"
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
    status: 'loading',
    accountsLoadingStatus: 'loading',
    error: {},
    dialog: false,
    dialogText: '',
  }),
  computed: {
    currentAccount() {
      return this.$store.state.currentAccount.accountId;
    },
    allApplets() {
      return this.$store.state.allApplets;
    },
    currentApplet() {
      return this.$store.state.currentApplet;
    },
    accountApplets() {
      return this.$store.state.currentApplets;
    },
  },
  watch: {
    currentAccount(newAccount, oldAccount) {
      this.getApplets();   
    },
    accountApplets(newApplets, oldApplets) {
      this.getApplets();
    }
  },
  mounted() {
    this.getAccountData();
  },
  methods: {
    getAccountData() {
      const accountId = this.$store.state.currentAccount.accountId;
      api.switchAccount({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        accountId
      }).then((resp) => {
        this.$store.commit('switchAccount', resp.data.account);
      }).catch((err) => {
        console.warn(err);
      });
    },
    getApplets() {
      this.status = 'loading';
      const allApplets = [];

      if (!this.accountApplets || !this.accountApplets.length) {
        this.status = 'ready';
        return;
      }

      const requests = this.accountApplets.map((applet) => {
        return (
          new Promise((resolve, reject) => { 
            api.getApplet({
              apiHost: this.$store.state.backend,
              token: this.$store.state.auth.authToken.token,
              id: applet,
            })
            .then((response) => {
              resolve(response.data);
            })
          })
        );
      });
      Promise.all(requests).then((responses) => {
        this.$store.commit('setAllApplets', responses);
        this.status = 'ready';
      }).catch((e) => {
        this.status = 'error';
      });
    },
    onAppletUploadSuccessful() {
      this.dialogText = 'The applet is being created. Please check back in several mintutes to see it.';
      this.dialog = true;
    },
    onAppletUploadError() {
      this.dialogText = 'There was an error uploading your applet. Please try again or report the issue.'
      this.dialog = true;
    },
  },
}
</script>
