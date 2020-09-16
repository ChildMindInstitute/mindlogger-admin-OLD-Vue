<template>
  <v-container fluid>
    <Loading v-if="status === 'loading'" />
    <div v-else-if="status === 'error'" class="error">{{ error.message }}</div>
    <AllApplets
      v-else
      :applets="allApplets"
      @refreshAppletList="getAccountData"
      @appletUploadSuccessful="onAppletUploadSuccessful"
      @appletUploadError="onAppletUploadError"
      @onAppletPasswordChanged="onAppletPasswordChanged"
    />
    <Information
      v-model="dialog"
      :dialogText="dialogText"
      :title="dialogTitle"
    />
  </v-container>
</template>

<script>
import api from '../Components/Utils/api/api.vue';
import _ from 'lodash';
import AllApplets from '../Components/Applets/AllApplets';
import Loading from '../Components/Utils/Loading';
import { Parse, Day } from 'dayspan';
import Information from '../Components/Utils/dialogs/information.vue';
import config from '../config';

window.Parse = Parse;
window.Day = Day;

export default {
  name: "Applet",
  components: {
    AllApplets,
    Loading,
    Information,
  },
  data: () => ({
    sampleProtocols: config.protocols,
    status: "loading",
    accountsLoadingStatus: "loading",
    error: {},
    dialog: false,
    dialogText: '',
    dialogTitle: '',
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
    }
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
      if (!accountId) {
        this.status = "ready";
        return;
      }
      api
        .switchAccount({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          accountId
        })
        .then(resp => {
          this.$store.commit("switchAccount", resp.data.account);
        })
        .catch(err => {
          console.warn(err);
        });
    },
    getApplets() {
      this.status = "loading";
      const allApplets = [];

      if (!this.accountApplets || !this.accountApplets.length) {
        this.$store.commit("setAllApplets", []);
        this.status = "ready";
        return;
      }

      const requests = this.accountApplets.map(account => {
        return new Promise((resolve, reject) => {
          api
            .getApplet({
              apiHost: this.$store.state.backend,
              token: this.$store.state.auth.authToken.token,
              allEvent: account.allEvent,
              id: account.appletId
            })
            .then(response => {
              resolve(response.data);
            });
        });
      });
      Promise.all(requests)
        .then(responses => {
          this.$store.commit("setAllApplets", responses);
          this.$store.commit("updateAllApplets");
          this.status = "ready";
        })
        .catch(e => {
          this.status = "error";
        });
    },
    onAppletUploadSuccessful(message) {
      this.dialogTitle = 'Upload Received';
      this.dialogText = message;
      this.dialog = true;
    },
    onAppletUploadError() {
      this.dialogTitle = 'Upload Error';
      this.dialogText = 'There was an error uploading your applet. Please try again or report the issue.'
      this.dialog = true;
    },
    onAppletPasswordChanged() {
      this.dialogText = 'Applet password is updated successfully.';
      this.dialogTitle = 'Applet Encryption Update';
      this.dialog = true;
    }
  },
}
</script>
