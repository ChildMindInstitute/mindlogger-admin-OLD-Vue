<template>
  <v-content>
    <About v-if="aboutOpen" />
    <AppletSchemaBuilder
      v-else
      :key="componentKey"
      exportButton
      :initialData="(isEditing || null) && currentApplet"
      :getProtocols="getProtocols"
      :versions="versions"
      @uploadProtocol="onUploadProtocol"
      @updateProtocol="onUpdateProtocol"
      @prepareApplet="onPrepareApplet"
      @onUploadError="onUploadError"
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

import encryption from "../Utils/encryption/encryption.vue";
import AppletPassword from "../Utils/dialogs/AppletPassword";
import Information from "../Utils/dialogs/information";

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
      versions: [],
      componentKey: 1,
    };
  },
  computed: {
    currentApplet() {
      return this.$store.state.currentApplet;
    },
  },
  async beforeMount() {
    const apiHost = this.$store.state.backend;
    const token = this.$store.state.auth.authToken.token;
    const appletId = this.currentApplet.applet._id.split("/")[1];

    this.versions = [];

    if (this.$route.params.isEditing) {
      this.isEditing = true;

      const resp = await api.getAppletVersions({ apiHost, token, appletId });
      this.versions = resp.data;
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
      protocol.set("protocol", JSON.stringify(this.newApplet || {}));

      api
        .createApplet({
          data: protocol,
          email: this.$store.state.userEmail,
          token: this.$store.state.auth.authToken.token,
          apiHost: this.$store.state.backend,
        })
        .then((resp) => {
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

      const appletId = this.currentApplet.applet._id.split("/")[1];
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;
      api
        .updateApplet({
          data: protocol,
          appletId,
          token,
          apiHost,
        })
        .then((resp) => {
          this.$store.commit("updateAppletData", {
            ...resp.data,
            roles: this.currentApplet.roles,
          });

          api.getAppletVersions({ apiHost, token, appletId }).then((resp) => {
            this.versions = resp.data;
            this.componentKey = this.componentKey + 1;
          });

          this.onUploadSucess();
        })
        .catch((e) => {
          this.onUploadError();
        });
    },
    onPrepareApplet(data) {
      const protocol = new FormData();
      protocol.set("protocol", JSON.stringify(data || {}));

      const appletId = this.currentApplet.applet._id.split("/")[1];
      const token = this.$store.state.auth.authToken.token;
      const apiHost = this.$store.state.backend;

      api
        .prepareApplet({
          apiHost,
          token,
          data: protocol,
          appletId,
        })
        .then((resp) => api.getAppletVersions({ apiHost, token, appletId }))
        .then((resp) => {
          this.versions = resp.data;
          this.componentKey = this.componentKey + 1;
        });
    },
    onUploadSucess() {
      this.dialogText = "Your applet is successfully updated";
      this.dialogTitle = "Upload Received";
      this.dialog = true;
    },
    onUploadError(msg) {
      this.dialogText =
        msg ||
        "There was an error uploading your applet. Please try again or report the issue.";
      this.dialogTitle = "Upload Error";
      this.dialog = true;
    },
    getProtocols(versions) {
      if (!this.isEditing) return [];
      const appletId = this.currentApplet.applet._id.split("/")[1];

      return api.getProtocolData({
        apiHost: this.$store.state.backend,
        token: this.$store.state.auth.authToken.token,
        appletId,
        versions,
      });
    },
  },
};
</script>
