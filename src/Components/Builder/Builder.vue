<template>
  <v-content>
    <About v-if="aboutOpen" />
    <AppletSchemaBuilder
      v-else
      exportButton
      :initialData="(isEditing || null) && currentApplet"
      :key="componentKey"
      @uploadProtocol="onUploadProtocol"
      @updateProtocol="onUpdateProtocol"
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
      newApplet: {},
      isEditing: false,
      componentKey: 1
    };
  },
  beforeMount() {
    if (this.$route.params.isEditing) {
      this.isEditing = true;
    }
  },
  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    }
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
      protocol.set("protocol", JSON.stringify(newApplet || {}));

      api
        .createApplet({
          data: protocol,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
        })
        .then(resp => {
          this.onUploadSucess(resp.data.message);
        })
        .catch((e) => {
          console.log(e);
          this.onUploadError();
        });
    },
    onUpdateProtocol(updateData) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(updateData || {}));

      api.updateApplet({
        data: protocol,
        appletId: this.currentApplet.applet._id.split('/')[1],
        token: this.$store.state.auth.authToken.token,
        apiHost: this.$store.state.backend,
      }).then(resp => {
        this.$store.commit('updateAppletData', {
          ...resp.data,
          roles: this.currentApplet.roles
        });

        this.componentKey = this.componentKey + 1;

        this.onUploadSucess();
      }).catch(e => {
        this.onUploadError();
      })
    },
    onUploadSucess() {
        this.dialogText = 'Your applet is successfully updated';
        this.dialogTitle = 'Upload Received';
        this.dialog = true;
    },
    onUploadError() {
        this.dialogText = "There was an error uploading your applet. Please try again or report the issue.";
        this.dialogTitle = 'Upload Error';
        this.dialog = true;
    },
  }
};
</script>
