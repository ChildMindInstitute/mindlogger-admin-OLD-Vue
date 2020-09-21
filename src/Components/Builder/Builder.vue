<template>
  <v-content>
    <About v-if="aboutOpen" />
    <AppletSchemaBuilder
      v-else
      exportButton
      @uploadProtocol="onUploadProtocol"
    />

    <Information
      v-model="dialog"
      :dialogText="dialogText"
      :title="dialogTitle"
    />

    <AppletPassword
      v-model="appletPasswordDialog"
      @set-password="onClickSubmitPassword"
    />
  </v-content>
</template>

<script>
import Components from "applet-schema-builder";
import About from "./AboutBuilder";
import PackageJson from "../../../package.json";
import api from "../Utils/api/api.vue";
import { cloneDeep } from "lodash";

import encryption from '../Utils/encryption/encryption.vue';
import AppletPassword from '../Utils/dialogs/AppletPassword'
import Information from '../Utils/dialogs/information';

export default {
  name: "Builder",
  components: {
    ...Components,
    About,
    AppletPassword,
    Information,
  },
  data() {
    return {
      drawer: false,
      aboutOpen: false,
      package: PackageJson,
      dialog: false,
      dialogText: "",
      dialogTitle: "",
      appletPasswordDialog: false,
      newApplet: {}
    };
  },
  methods: {
    onClickSubmitPassword(appletPassword) {
      this.appletPasswordDialog = false;
      this.addNewApplet(appletPassword);
    },
    onUploadProtocol(newApplet) {
      this.newApplet = newApplet;
      this.appletPasswordDialog = true;
    },
    addNewApplet(appletPassword) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(this.newApplet || {}));

      const encryptionInfo = encryption.getAppletEncryptionInfo({
        appletPassword: appletPassword,
        accountId: this.$store.state.currentAccount.accountId
      });

      protocol.set(
        "encryption",
        JSON.stringify({
          appletPublicKey: Array.from(encryptionInfo.getPublicKey()),
          appletPrime: Array.from(encryptionInfo.getPrime()),
          base: Array.from(encryptionInfo.getGenerator())
        })
      );

      api
        .createApplet({
          data: protocol,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend
        })
        .then(resp => {
          this.dialogText = resp.data.message;
          this.dialogTitle = 'Upload Received';
          this.dialog = true;
        })
        .catch(e => {
          console.log(e);
          this.dialogText = "There was an error uploading your applet. Please try again or report the issue.";
          this.dialogTitle = 'Upload Error';
          this.dialog = true;
        });
    }
  }
};
</script>
