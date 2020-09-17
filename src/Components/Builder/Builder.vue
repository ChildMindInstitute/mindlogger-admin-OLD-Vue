<template>
  <v-content>
    <About v-if="aboutOpen" />
    <AppletSchemaBuilder
      v-else
      exportButton
      @uploadProtocol="onUploadProtocol"
      @duplicateApplet="onDuplicateApplet"
    />

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Upload Received
        </v-card-title>
        <v-card-text>{{ dialogText }}</v-card-text>
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

// import encryption from "../Utils/encryption/encryption.vue";
// import AppletPassword from "../Applets/AppletPassword";

import encryption from '../Utils/encryption/encryption.vue';
import AppletPassword from '../Utils/dialogs/AppletPassword'

export default {
  name: "Builder",
  components: {
    ...Components,
    About,
    AppletPassword
  },
  data() {
    return {
      drawer: false,
      aboutOpen: false,
      package: PackageJson,
      dialog: false,
      dialogText: "",
      appletPasswordDialog: false,
      newApplet: {}
    };
  },
  methods: {
    onDuplicateApplet(applet) {
      api
        .duplicateApplet({
          apiHost: this.$store.state.backend,
          token: this.$store.state.auth.authToken.token,
          appletId: applet.id,
          options: applet
        })
        .then(resp => {
          this.dialogText =
            "The applet is being duplicated. Please check back in several mintutes to see it.";
          this.dialog = true;
        })
        .catch(e => {
          console.log(e);
          this.dialogText =
            "There was an error duplicating your applet. Please try again or report the issue.";
          this.dialog = true;
        });
    },
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
          this.dialogText =
            "The applet is being created. Please check back in several mintutes to see it.";
          this.dialog = true;
        })
        .catch(e => {
          console.log(e);
          this.dialogText =
            "There was an error uploading your applet. Please try again or report the issue.";
          this.dialog = true;
        });
    }
  }
};
</script>
